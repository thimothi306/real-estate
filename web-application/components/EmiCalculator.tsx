'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';

function formatPrice(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function EmiCalculator({ defaultRate }: { defaultRate: number }) {
  const [principal, setPrincipal] = useState(6000000);
  const [rate, setRate] = useState(defaultRate);
  const [years, setYears] = useState(20);
  const [result, setResult] = useState<{ emi: number; total_payable: number; total_interest: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`${API}/loan-offers/emi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ principal, annual_rate: rate, tenure_years: years }),
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((payload) => {
          if (payload.success) {
            setResult(payload.data);
            setError(null);
          } else {
            setError(payload.message ?? 'Could not calculate EMI.');
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') setError('Could not reach the server.');
        });
    }, 250); // debounce so slider drags don't fire a request per pixel

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [principal, rate, years]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-lg font-bold text-foreground">EMI Calculator</h2>

      <div className="mt-6 space-y-6">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Loan amount</span>
            <span className="font-bold text-primary">{formatPrice(principal)}</span>
          </div>
          <input
            type="range"
            min={500000}
            max={50000000}
            step={100000}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="mt-3 w-full accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Interest rate</span>
            <span className="font-bold text-primary">{rate}% p.a.</span>
          </div>
          <input
            type="range"
            min={6}
            max={15}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-3 w-full accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Loan tenure</span>
            <span className="font-bold text-primary">{years} years</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="mt-3 w-full accent-primary"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      {result && (
        <div className="mt-6 rounded-xl bg-navy p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Monthly EMI</p>
          <p className="mt-1 text-3xl font-extrabold text-gold">
            ₹{Math.round(result.emi).toLocaleString('en-IN')}
            <span className="text-sm font-medium text-white/60">/month</span>
          </p>
          <div className="mt-4 flex justify-center gap-8 text-xs text-white/70">
            <div>
              <div className="font-semibold text-white">{formatPrice(result.total_interest)}</div>
              <div>Total Interest</div>
            </div>
            <div>
              <div className="font-semibold text-white">{formatPrice(result.total_payable)}</div>
              <div>Total Payable</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
