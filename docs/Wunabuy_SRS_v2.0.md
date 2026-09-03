# Software Requirements Specification (SRS)
# Wunabuy — Multi-Sided E-Commerce & Web Staff Operations Platform

**Document Version:** 2.0 (Enterprise Staff Operations & Mobile Synchronized Baseline)  
**Date:** September 3, 2026  
**Status:** Approved / In Production Use  
**Companion Documents:** Wunabuy PRD v1.8, Wunabuy Frontend Tech Spec v1.8, Wunabuy Backend Tech Spec v1.4  

---

## 🚀 Key Staff Portal v2.0 Architecture & Feature Specifications (September 2026)

- **2-Stage OTP Staff Authentication Flow (`AuthPage.tsx` & `staffAuthStore.ts`)**:
  - Stage 1: Corporate email/phone entry with 45-second resend timer and 1-tap demo auto-fill (`654321`).
  - Stage 2: 6-digit box grid with auto-focus and instant router redirection upon verification.
  
- **Strict Security RBAC Sidebar Filtering (`SidebarNav.tsx`)**:
  - Unauthorized navigation links are completely removed from the rendered DOM based on `hasPermission()`, leaving zero visual footprint when switching staff clearance roles.

- **Super Admin Dynamic Roles & Permissions Matrix CRUD (`SettingsPage.tsx` & `staffAuthStore.ts`)**:
  - Super Admins (Level 5 Clearance) can create custom staff roles, edit permission matrices across 13 system permission flags, and delete roles with level-5 `CRITICAL` audit logging.

- **Modern Soft SaaS UI Aesthetic (Inspired by Boltz Dashboard)**:
  - Canvas & Surface: Soft off-white blue slate background (`bg-[#F4F6FB]`) with rounded white cards (`bg-white rounded-2xl border border-slate-200/70 shadow-xs`).
  - Header & Top Bar: Compact header (`h-16 bg-white border-b border-slate-100`), fluid search pill, date period filter pill (`Filter Period`), notification drawer (`Bell` badge 12), support chat drawer (`MessageSquare` badge 5), and RBAC persona switcher.
  - Node Health Telemetry: Weather & node pill (`28°C Douala Node`) displaying live WebSocket latency (14ms) and active Reverb socket connections.

- **Mobile & Tablet Responsiveness Overhaul**:
  - Desktop (`lg:flex`): Fixed sidebar layout.
  - Mobile/Tablet (`lg:hidden`): Mobile slide-out overlay drawer with dark backdrop (`bg-slate-900/60 backdrop-blur-xs`), close button (`X`), and auto-dismiss upon navigation selection.
  - Scrollable Sidebar List (`flex-1 overflow-y-auto min-h-0`): Fixed brand header at top and fixed WSS status footer at bottom.

- **Internal Staff Chat & Official System Announcement Broadcast Center (`CommunicationsPage.tsx`)**:
  - Departmental Channels: `#general-hq`, `#finance-treasury`, `#compliance-kyc`, `#logistics-fleet`, `#executive-board`.
  - Direct Messaging: Chat directly with active colleagues (`Pauline Mbarga`, `Christian Atangana`, `Marie-Noelle Bikoe`, `Jean-Luc Fotso`, `Therese Abena`).
  - Official Broadcast Feed: Executive directives with severity badges (`URGENT 🚨`, `POLICY 📋`, `GENERAL 📣`) and target audience selection.

- **Advanced Data Table Primitive & Neutral Palette (`DataTable.tsx`)**:
  - Integrated real-time search bar per table.
  - Pagination controls ("Showing 1 to 5 of X entries", "Page 1 of Y", `Previous` and `Next` buttons).
  - Clean neutral slate typography (`text-slate-900 font-bold`, `text-slate-500 font-medium`).

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)  
3. [System Features & Functional Requirements](#3-system-features--functional-requirements)
4. [Staff Portal Functional Requirements](#4-staff-portal-functional-requirements)
5. [External Interface Requirements](#5-external-interface-requirements)
6. [Non-Functional & Security Requirements](#6-non-functional--security-requirements)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the complete functional, security, and architectural specifications for **Wunabuy**, covering the multi-sided mobile e-commerce application (Buyer, Seller, Transporter) and the enterprise **Web Staff Operations Portal**.

---

## 2. Overall Description

### 2.1 Product Perspective
Wunabuy operates as a unified platform connecting Buyers, Store Merchants, and Delivery Drivers in Cameroon via an Expo React Native mobile app, and Staff Operations via a Vite React Web Portal backed by Laravel 13 REST API and Reverb WebSockets.

---

## 3. System Features & Functional Requirements

### 3.1 Escrow & Order Lifecycle
- **FR-001:** Orders SHALL lock buyer funds in a 48-hour escrow hold until delivery confirmation.
- **FR-002:** Confirming delivery signature SHALL credit net seller balance after 3.5% commission deduction.
- **FR-003:** Disputed orders SHALL freeze escrow hold and escalate to staff adjudication in `DisputesPage.tsx`.

---

## 4. Staff Portal Functional Requirements

### 4.1 Staff Authentication & Security
- **STF-001:** Staff auth SHALL execute a 2-Stage OTP verification flow (`AuthPage.tsx`).
- **STF-002:** Navigation links SHALL filter strictly based on role clearance permissions (`SidebarNav.tsx`).
- **STF-003:** Every security sensitive operation SHALL emit an entry to the immutable audit log ledger (`auditLogs`).

### 4.2 Department Operations & Tools
- **STF-004:** KYC Compliance Queue (`KYCPage.tsx`) SHALL allow inspecting CNI front/back photos and approving or rejecting merchant/driver submissions.
- **STF-005:** Escrow Disputes (`DisputesPage.tsx`) SHALL support 3-way dispute investigation and 100% Buyer Refund, 100% Seller Release, or 50/50 Split rulings with mandatory rationale notes.
- **STF-006:** Logistics Telemetry (`LogisticsOpsPage.tsx`) SHALL display live GPS coordinates and allow staff manual trip status overrides.
- **STF-007:** Financials & Payouts (`FinancialsPage.tsx`) SHALL support security PIN authorization for MTN MoMo and Orange Money disbursals.
- **STF-008:** Internal Communications (`CommunicationsPage.tsx`) SHALL provide departmental chat channels and company-wide system announcement broadcasting.

---

## 5. Non-Functional & Security Requirements

- **NFR-001 Performance:** All data tables SHALL render paginated results in under 50ms.
- **NFR-002 Responsiveness:** Web Staff Portal SHALL support viewports from 375px mobile screens to 1440px desktop displays.
- **NFR-003 Auditability:** System audit logs SHALL be immutable and exportable to CSV.

