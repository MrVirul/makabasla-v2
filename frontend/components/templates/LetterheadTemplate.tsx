"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";

import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LetterData {
  date: string;
  to: string;
  subject: string;
  body: string;
  signatory: string;
}

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface Advance {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface BillingData {
  plate_number?: string;
  expenses: Expense[];
  advances: Advance[];
  total_expenses: number;
  total_advances: number;
  balance_due: number;
}

interface LetterheadProps {
  billingData?: BillingData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Style tokens (ink-saving: white dominant, amber as razor accent) ─────────
const T = {
  amber: "#E8960C",
  amberLight: "#FDF3DC",
  black: "#111111",
  ink: "#1E1E1E",
  muted: "#6B6B6B",
  rule: "#D8D4CC",
  page: "#FFFFFF",
  offwhite: "#FAFAF8",
  font: "'Barlow Condensed', sans-serif",
  body: "'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
};

// ─── Inline editable field ────────────────────────────────────────────────────
function EditField({
  value,
  onChange,
  multiline = false,
  style = {},
  placeholder = "Click to edit",
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  style?: React.CSSProperties;
  placeholder?: string;
}>) {
  const [focused, setFocused] = useState(false);
  const base: React.CSSProperties = {
    outline: "none",
    border: "none",
    borderBottom: focused
      ? `1.5px solid ${T.amber}`
      : "1.5px dashed transparent",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: "inherit",
    color: value ? T.ink : T.muted,
    fontStyle: value ? "normal" : "italic",
    width: "100%",
    resize: "none" as const,
    padding: "2px 0",
    lineHeight: "inherit",
    transition: "border-color 0.2s",
    cursor: "text",
    ...style,
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + "px";
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          ...base,
          display: "block",
          minHeight: 260,
          height: "auto",
          overflow: "hidden",
        }}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      style={base}
    />
  );
}

function Dot() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: T.amber,
        margin: "0 14px",
        flexShrink: 0,
        verticalAlign: "middle",
        position: "relative" as const,
        top: -1,
      }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MakabaslaLetterhead({ billingData }: Readonly<LetterheadProps>) {
  const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [data, setData] = useState<LetterData>({
    date: todayStr(),
    to: billingData?.plate_number ? `Vehicle: ${billingData.plate_number}` : "",
    subject: billingData ? "BILLING INVOICE & REPAIR STATEMENT" : "",
    body: billingData 
      ? `We are pleased to present the detailed billing statement for the vehicle referenced above. This statement includes all repair expenses and payments received to date.`
      : "",
    signatory: "Authorized Signatory",
  });

  const set = (key: keyof LetterData) => (v: string) =>
    setData((prev) => ({ ...prev, [key]: v }));

  const handlePrint = () => globalThis.print();

  const handleReset = () => {
    if (confirm("Reset all fields?"))
      setData({
        date: todayStr(),
        to: "",
        subject: "",
        body: "",
        signatory: "Authorized Signatory",
      });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;700;900&family=Barlow:wght@300;400;500&display=swap');

        @page {
          margin: 0;
          size: auto;
        }

        @media print {
          /* Force hide ALL browser/platform/dashboard artifacts */
          * { 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print, 
          [data-sidebar="sidebar"],
          [data-slot="sidebar-inset"] > header,
          .group.peer,
          aside,
          nav:not(.letterhead-page nav) { 
            display: none !important; 
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          body, html { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important;
            height: auto !important;
            width: 100% !important;
            overflow: visible !important;
          }

          .letterhead-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            display: block !important;
            min-height: 100% !important;
            overflow: visible !important;
          }

          .letterhead-page {
            box-shadow: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            border: none !important;
            transform: none !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
        }

        ::placeholder { color: #AAAAAA; font-style: italic; }
        textarea { overflow: hidden; }
      `}</style>

      {/* ── Toolbar ── */}
      <div
        className="no-print"
        style={{
          background: T.offwhite,
          borderBottom: `1px solid ${T.rule}`,
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: T.font,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.1em",
            color: T.muted,
            textTransform: "uppercase",
            marginRight: 8,
          }}
        >
          Makabasla · {billingData ? "Invoice" : "Letterhead"}
        </span>
        <div style={{ flex: 1 }} />
        {billingData && (
          <button
            onClick={() => router.back()}
            style={{
              fontFamily: T.font,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "8px 20px",
              background: "transparent",
              border: `1px solid ${T.rule}`,
              color: T.muted,
              cursor: "pointer",
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={handleReset}
          style={{
            fontFamily: T.font,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "8px 20px",
            background: "transparent",
            border: `1px solid ${T.rule}`,
            color: T.muted,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
        <button
          onClick={handlePrint}
          style={{
            fontFamily: T.font,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "8px 24px",
            background: T.amber,
            border: "none",
            color: T.black,
            cursor: "pointer",
          }}
        >
          Print / Save PDF
        </button>
      </div>

      {/* ── Page wrapper ── */}
      <div
        className="letterhead-wrapper"
        style={{
          background: "#EDEAE4",
          minHeight: "100vh",
          padding: "48px 24px",
          display: "flex",
          justifyContent: "center",
          fontFamily: T.body,
        }}
      >
        {/* ── A4 Page ── */}
        <div
          ref={printRef}
          className="letterhead-page"
          style={{
            width: 794,
            minHeight: 1123,
            background: T.page,
            boxShadow: "0 4px 40px rgba(0,0,0,0.14)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <header>
            {/* Top zone: logo unit LEFT · contact RIGHT */}
            <div
              style={{
                padding: "32px 52px 22px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              {/* LEFT — single logo + thin rule + brand text */}
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src="/home/common/letterheadlogo.png"
                    alt="Makabasla"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>

                <div
                  style={{
                    width: 1,
                    height: 44,
                    background: T.rule,
                    flexShrink: 0,
                  }}
                />

                <div>
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 8 }}
                  >
                    <span
                      style={{
                        fontFamily: T.font,
                        fontWeight: 900,
                        fontSize: 28,
                        color: T.black,
                        letterSpacing: "0.04em",
                        lineHeight: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      MAKABASLA
                    </span>
                    <span
                      style={{
                        fontFamily: T.font,
                        fontWeight: 400,
                        fontSize: 11,
                        color: T.muted,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        paddingBottom: 2,
                      }}
                    >
                      (PVT) Ltd
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: T.font,
                      fontWeight: 400,
                      fontSize: 10,
                      color: T.muted,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      marginTop: 5,
                    }}
                  >
                    Jeep Modification &amp; Repair Specialists
                  </div>
                </div>
              </div>

              {/* RIGHT — contact, tiered by importance */}
              <div
                style={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  paddingTop: 4,
                }}
              >
                <div
                  style={{
                    fontFamily: T.font,
                    fontWeight: 700,
                    fontSize: 14,
                    color: T.ink,
                    letterSpacing: "0.06em",
                    lineHeight: 1.2,
                  }}
                >
                  +94 77 221 5243 &nbsp;·&nbsp; +94 71 370 2426
                </div>
                <div
                  style={{
                    fontFamily: T.body,
                    fontSize: 11.5,
                    color: T.muted,
                    letterSpacing: "0.02em",
                  }}
                >
                  makabasla.garage@gmail.com
                </div>
                <div
                  style={{
                    fontFamily: T.body,
                    fontSize: 10,
                    color: "#AAAAAA",
                    letterSpacing: "0.06em",
                    marginTop: 2,
                  }}
                >
                  Business Reg · PV00328799
                </div>
              </div>
            </div>

            {/* Amber-anchored divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 52px",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 2.5,
                  background: T.amber,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, height: 1, background: T.rule }} />
            </div>

            {/* Specialisation strip — tinted band, center-aligned */}
            <div
              style={{
                background: "#fcfcfc",
                borderBottom: `1px solid ${T.rule}`,
                padding: "10px 52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {["Jeep", "Land Cruiser", "Defender", "Nissan Patrol"].map(
                (item, i) => (
                  <React.Fragment key={item}>
                    {i > 0 && <Dot />}
                    <span
                      style={{
                        fontFamily: T.font,
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#888888",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item}
                    </span>
                  </React.Fragment>
                ),
              )}
              <Dot />
              <span
                style={{
                  fontFamily: T.font,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#888888",
                }}
              >
                Modification &amp; Repair
              </span>
            </div>
          </header>

          <main style={{ flex: 1, padding: "40px 52px 32px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                marginBottom: 40,
              }}
            >
              <div>
                <Label>date</Label>
                <EditField
                  value={data.date}
                  onChange={set("date")}
                  placeholder="DD Month YYYY"
                  style={{
                    fontFamily: T.font,
                    fontSize: 14,
                    fontWeight: 500,
                    width: 180,
                  }}
                />
              </div>
              <div>
                <Label>addressed to</Label>
                <EditField
                  value={data.to}
                  onChange={set("to")}
                  placeholder="Recipient Name / Company"
                  style={{ fontFamily: T.font, fontSize: 14, width: 280 }}
                />
              </div>
            </div>

            <div>
              <Label>Subject</Label>
              <EditField
                value={data.subject}
                onChange={set("subject")}
                placeholder="Enter subject line"
                style={{
                  fontFamily: T.font,
                  fontWeight: 700,
                  fontSize: 18,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: T.black,
                  width: "100%",
                }}
              />
            </div>

            <EditField
              value={data.body}
              onChange={set("body")}
              multiline
              placeholder={`We are pleased to present this correspondence on behalf of Makabasla PVT Ltd — Sri Lanka's premier specialist in 4×4 vehicle modification and repair.\n\nOur expertise covers Jeep, Land Cruiser, Defender, and Nissan Patrol — from performance upgrades and off-road builds to full restoration and mechanical servicing.\n\n[ Continue writing your letter here... ]\n\nShould you have any inquiries, please contact us at the numbers provided. We look forward to being of service.`}
              style={{
                fontFamily: T.body,
                fontSize: 13.5,
                color: T.ink,
                lineHeight: "1.85",
                borderBottom: "none",
                border: "none",
                padding: 0,
                minHeight: billingData ? 80 : 260,
              }}
            />

            {billingData && (
              <div style={{ marginTop: 40, fontFamily: T.body }}>
                {/* Expenses Table */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ 
                    fontFamily: T.font, 
                    fontSize: 14, 
                    fontWeight: 700, 
                    textTransform: "uppercase", 
                    letterSpacing: "0.1em",
                    color: T.black,
                    borderBottom: `1.5px solid ${T.amber}`,
                    paddingBottom: 6,
                    marginBottom: 16
                  }}>
                    Repair Expenses
                  </h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: T.black, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.05em", fontWeight: 700 }}>
                        <th style={{ padding: "8px 0", borderBottom: `1.5px solid ${T.black}` }}>Date</th>
                        <th style={{ padding: "8px 0", borderBottom: `1.5px solid ${T.black}` }}>Description</th>
                        <th style={{ padding: "8px 0", borderBottom: `1.5px solid ${T.black}`, textAlign: "right" }}>Amount (Rs.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingData.expenses.map((e) => (
                        <tr key={e.id} style={{ color: T.black }}>
                          <td style={{ padding: "10px 0", borderBottom: `1px solid ${T.rule}` }}>{e.date}</td>
                          <td style={{ padding: "10px 0", borderBottom: `1px solid ${T.rule}` }}>{e.description}</td>
                          <td style={{ padding: "10px 0", borderBottom: `1px solid ${T.rule}`, textAlign: "right", fontWeight: 500 }}>
                            {e.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} style={{ padding: "12px 0", fontWeight: 700, textAlign: "right", fontSize: 11, textTransform: "uppercase" }}>Total Expenses:</td>
                        <td style={{ padding: "12px 0", fontWeight: 700, textAlign: "right", color: T.ink }}>
                          Rs. {billingData.total_expenses.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Payments Table */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ 
                    fontFamily: T.font, 
                    fontSize: 14, 
                    fontWeight: 700, 
                    textTransform: "uppercase", 
                    letterSpacing: "0.1em",
                    color: T.black,
                    borderBottom: `1.5px solid ${T.rule}`,
                    paddingBottom: 6,
                    marginBottom: 16
                  }}>
                    Payments Received
                  </h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: T.black, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.05em", fontWeight: 700 }}>
                        <th style={{ padding: "8px 0", borderBottom: `1.5px solid ${T.black}` }}>Date</th>
                        <th style={{ padding: "8px 0", borderBottom: `1.5px solid ${T.black}` }}>Description</th>
                        <th style={{ padding: "8px 0", borderBottom: `1.5px solid ${T.black}`, textAlign: "right" }}>Amount (Rs.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingData.advances.map((a) => (
                        <tr key={a.id} style={{ color: T.black }}>
                          <td style={{ padding: "10px 0", borderBottom: `1px solid ${T.rule}` }}>{a.date}</td>
                          <td style={{ padding: "10px 0", borderBottom: `1px solid ${T.rule}` }}>{a.description}</td>
                          <td style={{ padding: "10px 0", borderBottom: `1px solid ${T.rule}`, textAlign: "right", fontWeight: 500 }}>
                            {a.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} style={{ padding: "12px 0", fontWeight: 700, textAlign: "right", fontSize: 11, textTransform: "uppercase" }}>Total Payments:</td>
                        <td style={{ padding: "12px 0", fontWeight: 700, textAlign: "right", color: T.ink }}>
                          Rs. {billingData.total_advances.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Balance Summary */}
                <div style={{ 
                  background: T.offwhite, 
                  padding: "20px", 
                  border: `1px solid ${T.rule}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ fontFamily: T.font, fontWeight: 700, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Balance Due:</span>
                  <span style={{ fontFamily: T.font, fontWeight: 900, fontSize: 24, color: T.amber }}>
                    Rs. {billingData.balance_due.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: 56,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <div
                  style={{
                    width: 180,
                    height: 1,
                    background: T.black,
                    marginBottom: 8,
                  }}
                />
                <EditField
                  value={data.signatory}
                  onChange={set("signatory")}
                  placeholder="Name"
                  style={{
                    fontFamily: T.font,
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: T.black,
                    width: 200,
                  }}
                />
              </div>
            </div>
          </main>

          <footer style={{ padding: "0 52px 32px" }}>
            <div style={{ display: "flex", marginBottom: 16 }}>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: T.rule,
                  marginTop: 0.5,
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontFamily: T.font,
                fontSize: 10.5,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: T.muted,
              }}
            >
              <span>Makabasla PVT Ltd · Reg: PV00328799</span>
              <span style={{ color: T.rule }}>·</span>
              <span>+94 77 221 5243 · +94 71 370 2426</span>
              <span style={{ color: T.rule }}>·</span>
              <span style={{ color: T.amber }}>makabasla.garage@gmail.com</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

// ─── Label helper ─────────────────────────────────────────────────────────────
function Label({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="no-print"
      style={{
        fontFamily: T.font,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "lowercase",
        color: T.muted,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}
