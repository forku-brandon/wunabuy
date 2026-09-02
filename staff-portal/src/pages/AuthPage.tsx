import React, { useState, useRef, useEffect } from 'react';
import { useStaffAuth } from '../stores/staffAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldCheck, Mail, ArrowRight, ArrowLeft, KeyRound, Sparkles, RefreshCw } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { requestOTP, verifyOTP } = useStaffAuth();
  const [stage, setStage] = useState<'identifier' | 'otp'>('identifier');
  const [identifier, setIdentifier] = useState('pauline.admin@wunabuy.com');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(45);

  const digitInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (stage === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, resendTimer]);

  const handleRequestOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');
    const res = await requestOTP(identifier);
    setLoading(false);

    if (res.success) {
      setInfoMessage(res.message);
      setStage('otp');
      setResendTimer(45);
      setTimeout(() => {
        digitInputs.current[0]?.focus();
      }, 150);
    } else {
      setError(res.message);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      digitInputs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '')) {
      handleVerifyCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (codeOverride?: string) => {
    const code = codeOverride || otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');
    const success = await verifyOTP(identifier, code);
    setLoading(false);

    if (!success) {
      setError('Invalid OTP code. Please enter 654321 or check your code.');
    }
  };

  const handleAutoFillDemoOTP = () => {
    const demoCode = ['6', '5', '4', '3', '2', '1'];
    setOtpDigits(demoCode);
    handleVerifyCode('654321');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-xl mb-3 font-heading border-2 border-teal-400">
            W
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">Wunabuy Staff Portal</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            2-Factor OTP Corporate Authentication &amp; Adjudication Console
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold text-center">
            {error}
          </div>
        )}

        {infoMessage && stage === 'otp' && (
          <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 font-medium text-center">
            {infoMessage}
          </div>
        )}

        {stage === 'identifier' ? (
          /* STAGE 1: IDENTIFIER INPUT */
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Corporate Email or Employee Phone *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="pauline.admin@wunabuy.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span>
                Staff 2-Factor OTP Security Enforced. A 6-digit authentication code will be sent to your registered corporate channel.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-xs font-bold"
              loading={loading}
            >
              <span>Send 6-Digit OTP Code</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        ) : (
          /* STAGE 2: 6-DIGIT OTP BOX GRID */
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                <span>Enter OTP sent to <strong className="font-extrabold text-slate-900">{identifier}</strong></span>
              </span>
            </div>

            {/* 6-Digit Input Box Grid */}
            <div className="flex justify-center items-center space-x-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (digitInputs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:bg-white focus:outline-none shadow-sm transition-all"
                />
              ))}
            </div>

            {/* Demo Quick Auto-Fill Action */}
            <button
              onClick={handleAutoFillDemoOTP}
              className="w-full py-2 px-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>1-Tap Auto-Fill Demo OTP (654321)</span>
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStage('identifier')}
                className="text-slate-500 hover:text-slate-800 flex items-center font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </button>

              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={handleRequestOTP}
                className={`flex items-center font-bold ${
                  resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-teal-600 hover:underline'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>

            <Button
              variant="primary"
              className="w-full py-3 text-xs font-bold"
              loading={loading}
              onClick={() => handleVerifyCode()}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Verify OTP Code &amp; Access Portal
            </Button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Protected Wunabuy Monorepo • 48-Hour Escrow System Operations
          </p>
        </div>
      </div>
    </div>
  );
};
