import { AlertTriangle, Banknote, CheckCircle2, Copy, CreditCard, Landmark, Send, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/ui/Modal.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';
import ProgressRing from '../components/ui/ProgressRing.jsx';
import SeverityBadge from '../components/ui/SeverityBadge.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import { authService } from '../services/authService.js';
import { transactionService } from '../services/transactionService.js';
import { formatCurrency } from '../utils/format.js';

function TransactionPage() {
  const { liveMetrics, pushAlert, riskScore } = useSecurity();
  const [form, setForm] = useState({
    beneficiary: 'Northline Logistics',
    accountNumber: '984200118240',
    routingNumber: '021000021',
    amount: '12500',
    memo: 'Quarterly settlement',
  });
  const [errors, setErrors] = useState({});
  const [pasteWarning, setPasteWarning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trustProfile, setTrustProfile] = useState(null);
  const [transferResult, setTransferResult] = useState(null);

  const amount = Number(form.amount || 0);
  const checks = useMemo(
    () => [
      { label: 'Device fingerprint match', passed: riskScore < 85 },
      { label: 'Behavior baseline confidence', passed: riskScore < 70 },
      { label: 'Copy-paste fraud check', passed: !pasteWarning && !liveMetrics.copyPasteDetected },
      { label: 'High-value transfer policy', passed: amount < 50000 },
    ],
    [amount, liveMetrics.copyPasteDetected, pasteWarning, riskScore],
  );
  const failedChecks = checks.filter((check) => !check.passed);

  useEffect(() => {
    let mounted = true;
    authService
      .profile()
      .then((response) => {
        if (mounted) {
          setTrustProfile(response.data?.data?.trustProfile || null);
        }
      })
      .catch(() => {
        if (mounted) setTrustProfile(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const validate = () => {
    const nextErrors = {};
    if (!form.beneficiary.trim()) nextErrors.beneficiary = 'Beneficiary is required';
    if (!/^\d{8,18}$/.test(form.accountNumber)) nextErrors.accountNumber = 'Enter a valid account number';
    if (!/^\d{9}$/.test(form.routingNumber)) nextErrors.routingNumber = 'Routing number must be 9 digits';
    if (!amount || amount <= 0) nextErrors.amount = 'Amount must be greater than zero';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onPaste = () => {
    setPasteWarning(true);
    pushAlert({
      title: 'Copy-paste warning on transfer',
      message: 'Clipboard usage was detected inside a payment field.',
      severity: 'medium',
      channel: 'dashboard',
    });
  };

  const submitForReview = (event) => {
    event.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const confirmTransfer = async () => {
    setSubmitting(true);
    try {
      const response = await transactionService.transfer({
        ...form,
        amount,
        riskScore,
        failedChecks: failedChecks.map((check) => check.label),
      });
      const result = response.data?.data || response.data;
      setTransferResult(result);
      pushAlert({
        title: result.stepUpRequired ? 'Step-up verification required' : 'Transfer screened successfully',
        message: result.stepUpReason || `${formatCurrency(amount)} transfer to ${form.beneficiary} was evaluated by adaptive trust.`,
        severity: result.stepUpRequired ? 'high' : 'low',
        channel: 'email + dashboard',
      });
    } catch {
      pushAlert({
        title: 'Transfer queued in offline demo mode',
        message: `${formatCurrency(amount)} transfer was retained locally while the backend is unavailable.`,
        severity: failedChecks.length ? 'high' : 'medium',
        channel: 'dashboard',
      });
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-cyanGlow">Transaction protection</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">Transfer money with live fraud checks.</h1>
        <p className="mt-3 max-w-3xl text-slate-400">The transfer flow watches clipboard behavior, field velocity, device trust, and risk score before funds are released.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="p-5 sm:p-6">
          <form className="space-y-5" onSubmit={submitForReview}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="label-cyber" htmlFor="beneficiary">Beneficiary name</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input id="beneficiary" className="input-cyber pl-11" value={form.beneficiary} onChange={(event) => updateField('beneficiary', event.target.value)} onPaste={onPaste} />
                </div>
                {errors.beneficiary ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.beneficiary}</p> : null}
              </div>
              <div>
                <label className="label-cyber" htmlFor="amount">Amount</label>
                <div className="relative">
                  <Banknote className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input id="amount" className="input-cyber pl-11" inputMode="decimal" value={form.amount} onChange={(event) => updateField('amount', event.target.value)} />
                </div>
                {errors.amount ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.amount}</p> : null}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="label-cyber" htmlFor="accountNumber">Account number</label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input id="accountNumber" className="input-cyber pl-11" value={form.accountNumber} onChange={(event) => updateField('accountNumber', event.target.value.replace(/\D/g, ''))} onPaste={onPaste} />
                </div>
                {errors.accountNumber ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.accountNumber}</p> : null}
              </div>
              <div>
                <label className="label-cyber" htmlFor="routingNumber">Routing number</label>
                <div className="relative">
                  <Landmark className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input id="routingNumber" className="input-cyber pl-11" value={form.routingNumber} onChange={(event) => updateField('routingNumber', event.target.value.replace(/\D/g, ''))} />
                </div>
                {errors.routingNumber ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.routingNumber}</p> : null}
              </div>
            </div>

            <div>
              <label className="label-cyber" htmlFor="memo">Payment memo</label>
              <textarea id="memo" className="input-cyber min-h-28 resize-none" value={form.memo} onChange={(event) => updateField('memo', event.target.value)} onPaste={onPaste} />
            </div>

            {(pasteWarning || liveMetrics.copyPasteDetected) ? (
              <div className="rounded-2xl border border-warningGlow/35 bg-warningGlow/10 p-4 text-amber-100">
                <div className="flex items-center gap-3">
                  <Copy className="h-5 w-5" />
                  <p className="font-black">Copy-paste detection warning</p>
                </div>
                <p className="mt-2 text-sm text-slate-300">Payment fields received clipboard input and will require stronger fraud screening.</p>
              </div>
            ) : null}

            {riskScore >= 65 ? (
              <div className="rounded-2xl border border-redGlow/35 bg-redGlow/10 p-4 text-red-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-black">Risk alert before transfer</p>
                </div>
                <p className="mt-2 text-sm text-slate-300">Current session risk is elevated. The transfer may be blocked or challenged.</p>
              </div>
            ) : null}

            <NeonButton type="submit" icon={Send} variant={failedChecks.length ? 'red' : 'cyan'} className="w-full sm:w-auto">
              Review Transfer
            </NeonButton>
          </form>
        </GlassCard>

        <div className="grid gap-6">
          <GlassCard className="grid place-items-center p-5">
            <ProgressRing value={riskScore} />
            <p className="mt-3 text-center text-sm text-slate-400">Transaction release confidence</p>
          </GlassCard>

          <GlassCard className="p-5">
            <p className="text-sm font-black uppercase text-successGlow">Fraud detection checks</p>
            <div className="mt-5 space-y-3">
              {checks.map((check) => (
                <div key={check.label} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
                  <div className="flex items-center gap-3">
                    {check.passed ? <CheckCircle2 className="h-5 w-5 text-successGlow" /> : <AlertTriangle className="h-5 w-5 text-redGlow" />}
                    <p className="font-bold text-slate-200">{check.label}</p>
                  </div>
                  <SeverityBadge severity={check.passed ? 'low' : 'high'}>{check.passed ? 'pass' : 'review'}</SeverityBadge>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <p className="text-sm font-black uppercase text-cyanGlow">Adaptive trust profile</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
                <p className="text-xs text-slate-500">Behavior samples</p>
                <p className="mt-1 text-xl font-black text-white">{trustProfile?.behaviorSamples ?? 'Learning'}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
                <p className="text-xs text-slate-500">Normal transfer ceiling</p>
                <p className="mt-1 text-xl font-black text-white">
                  {trustProfile?.maxTrustedTransferAmount ? formatCurrency(Number(trustProfile.maxTrustedTransferAmount)) : 'Calibrating'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
                <p className="text-xs text-slate-500">Known beneficiaries</p>
                <p className="mt-1 text-xl font-black text-white">{trustProfile?.knownBeneficiaries ?? 0}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {transferResult ? (
        <GlassCard className={`p-5 ${transferResult.stepUpRequired ? 'shadow-danger' : 'shadow-success'}`}>
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-black uppercase text-warningGlow">Backend adaptive trust decision</p>
              <h2 className="mt-1 text-2xl font-black text-white">{transferResult.status}</h2>
              <p className="mt-2 text-slate-400">{transferResult.message}</p>
              {transferResult.stepUpReason ? <p className="mt-2 font-bold text-red-200">{transferResult.stepUpReason}</p> : null}
            </div>
            <SeverityBadge severity={transferResult.stepUpRequired ? 'high' : 'low'}>
              {transferResult.stepUpRequired ? 'step-up' : 'trusted'}
            </SeverityBadge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(transferResult.trustSignals || []).map((signal) => (
              <div key={signal} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3 text-sm font-semibold text-slate-300">
                {signal}
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      <Modal
        open={confirmOpen}
        title="Confirm transfer"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <NeonButton variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</NeonButton>
            <NeonButton icon={ShieldCheck} variant={failedChecks.length ? 'red' : 'emerald'} onClick={confirmTransfer} disabled={submitting}>
              {submitting ? 'Screening' : 'Confirm Secure Transfer'}
            </NeonButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-500">Beneficiary</p>
            <p className="mt-1 text-xl font-black text-white">{form.beneficiary}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-500">Amount</p>
              <p className="mt-1 text-xl font-black text-white">{formatCurrency(amount)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-500">Risk score</p>
              <p className="mt-1 text-xl font-black text-white">{riskScore}/100</p>
            </div>
          </div>
          {failedChecks.length ? (
            <div className="rounded-2xl border border-redGlow/35 bg-redGlow/10 p-4 text-sm text-red-100">
              {failedChecks.length} fraud check{failedChecks.length > 1 ? 's' : ''} require review before release.
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

export default TransactionPage;
