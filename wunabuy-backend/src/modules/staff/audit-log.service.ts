import { supabase } from '../../config/database';
import { hashChain } from '../../shared/utils/crypto';
import { logger } from '../../config/logger';

export const auditLogService = {
  async log(params: {
    staffId: string;
    action: string;
    entityType: string;
    entityId?: string;
    beforeState?: any;
    afterState?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      // Get previous hash
      const { data: lastEntry } = await supabase
        .from('audit_log')
        .select('current_hash')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      const previousHash = lastEntry?.current_hash || 'GENESIS';

      // Compute current hash
      const currentHash = hashChain(previousHash, {
        action: params.action,
        entityId: params.entityId,
        staffId: params.staffId,
        createdAt: new Date().toISOString(),
        beforeState: params.beforeState,
        afterState: params.afterState,
      });

      await supabase.from('audit_log').insert({
        staff_id: params.staffId,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        before_state: params.beforeState,
        after_state: params.afterState,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        previous_hash: previousHash,
        current_hash: currentHash,
      });

      logger.info({ action: params.action, staffId: params.staffId }, 'Audit log entry created');
    } catch (err) {
      logger.error({ err, params }, 'Failed to write audit log');
      throw err;
    }
  },

  async query(params: {
    staffId?: string;
    action?: string;
    entityType?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    cursor?: string;
  }) {
    let query = supabase.from('audit_log').select('*').order('id', { ascending: false });

    if (params.staffId) query = query.eq('staff_id', params.staffId);
    if (params.action) query = query.eq('action', params.action);
    if (params.entityType) query = query.eq('entity_type', params.entityType);
    if (params.fromDate) query = query.gte('created_at', params.fromDate);
    if (params.toDate) query = query.lte('created_at', params.toDate);

    const limit = params.limit || 50;
    query = query.limit(limit + 1);

    const { data, error } = await query;
    if (error) throw error;

    const hasMore = data.length > limit;
    const results = hasMore ? data.slice(0, limit) : data;

    return {
      data: results,
      meta: { pagination: { has_more: hasMore, next_cursor: hasMore ? results[results.length - 1].id.toString() : null } },
    };
  },
};
