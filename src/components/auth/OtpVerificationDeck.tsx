import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher';

const CODE_LENGTH = 4;
const RESEND_COOLDOWN_SECONDS = 45;

export default function OtpVerificationDeck() {
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const { t } = useTranslation();
  const [email] = useState(() => {
    const stateEmail = (location.state as { email?: string } | null)?.email;
    return stateEmail || sessionStorage.getItem('pendingVerificationEmail') || '';
  });
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isFocused, setIsFocused] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [shake, setShake] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const submittedCodeRef = useRef('');
  const submittedCode = code.join('');

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
      return;
    }

    sessionStorage.setItem('pendingVerificationEmail', email);
    inputRefs.current[0]?.focus();
  }, [email, location.state, navigate]);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!isVerified) return;
    const timer = window.setTimeout(() => navigate('/dashboard', { replace: true }), 900);
    return () => window.clearTimeout(timer);
  }, [isVerified, navigate]);

  useEffect(() => {
    if (submittedCode.length !== CODE_LENGTH || isVerifying || isVerified || !email || submittedCodeRef.current === submittedCode) return;
    submittedCodeRef.current = submittedCode;

    const verifyCode = async () => {
      setIsVerifying(true);
      setError('');
      setResendMessage('');
      try {
        await axios.post('/api/auth/verify-email', { email, code: submittedCode }, { timeout: 15000 });
        setIsVerified(true);
        sessionStorage.removeItem('pendingVerificationEmail');
      } catch (err: unknown) {
        setError(
          axios.isAxiosError(err)
            ? err.code === 'ECONNABORTED'
              ? t('otp.resendTimeout')
              : err.response?.data?.message || t('otp.invalid')
            : t('otp.invalid'),
        );
        setShake((current) => current + 1);
      } finally {
        setIsVerifying(false);
      }
    };

    void verifyCode();
  }, [email, isVerifying, isVerified, navigate, submittedCode, t]);

  const updateCode = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setError('');
    setResendMessage('');
    setIsFocused(true);
    setCode((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    submittedCodeRef.current = '';
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedCode = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pastedCode) return;
    setCode(Array.from({ length: CODE_LENGTH }, (_, index) => pastedCode[index] || ''));
    setIsFocused(true);
    inputRefs.current[Math.min(pastedCode.length, CODE_LENGTH) - 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;
    setIsResending(true);
    setError('');
    setResendMessage('');
    try {
      await axios.post('/api/auth/resend-code', { email }, { timeout: 15000 });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setResendMessage('A new verification code was sent.');
      setCode(Array(CODE_LENGTH).fill(''));
      submittedCodeRef.current = '';
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err)
          ? err.code === 'ECONNABORTED'
            ? t('otp.resendTimeout')
            : err.response?.data?.message || t('otp.resendFailed')
          : t('otp.resendFailed'),
      );
    } finally {
      setIsResending(false);
    }
  };

  const cardVariants = {
    stacked: (index: number) => ({
      rotate: [-12, -4, 4, 12][index],
      x: 0,
      y: index * 2,
    }),
    row: { rotate: 0, x: 0, y: 0 },
  };

  return (
    <main className="relative flex min-h-[min(720px,calc(100vh-2rem))] w-full max-w-xl items-center justify-center px-3 py-8 text-white">
      <motion.div
        key={shake}
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
        className="relative w-full rounded-[24px] border border-[#22272e] bg-[#121518] px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:px-10 sm:py-10"
      >
        <div className="mb-5 flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="mb-10 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d8792]">{t('otp.component')} <span className="text-[#b5bec8]">• 100</span></p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t('otp.verification')}</h1>
          </div>
          <span className="rounded-full border border-[#303842] bg-[#1b2025] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b5bec8]">{t('otp.deck')}</span>
        </div>

        <p className="text-sm text-[#8f9aa5]">
          {isVerified ? t('otp.settingUp') : <>{t('otp.sentTo')} <span className="text-[#d9e0e6]">{email}</span></>}
        </p>
        <h2 className="mt-2 text-2xl font-medium">{isVerified ? t('otp.verified') : t('otp.enterCode')}</h2>

        <motion.div
          className="relative mx-auto my-12 flex h-28 w-full max-w-[310px] cursor-text items-center justify-center gap-3 sm:max-w-[350px]"
          onClick={() => { setIsFocused(true); inputRefs.current[code.findIndex((digit) => !digit) === -1 ? 3 : code.findIndex((digit) => !digit)]?.focus(); }}
          animate={isVerified ? { opacity: 0, scale: 0.85 } : { opacity: 1, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
        >
          {isVerified ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-[#c8f7d5] text-[#168043]"
            >
              <Check size={38} strokeWidth={2.5} />
            </motion.div>
          ) : (
            code.map((digit, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="stacked"
                animate={isFocused ? 'row' : 'stacked'}
                transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: [0.65, 0, 0.35, 1] }}
                className={`${isFocused ? 'relative' : 'absolute'} h-20 w-16 sm:h-24 sm:w-20`}
                style={{ zIndex: CODE_LENGTH - index }}
              >
                <input
                  ref={(element) => { inputRefs.current[index] = element; }}
                  aria-label={t('otp.digit', { count: index + 1 })}
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  inputMode="numeric"
                  maxLength={1}
                  pattern="[0-9]*"
                  value={digit}
                  onFocus={() => setIsFocused(true)}
                  onChange={(event) => updateCode(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  className="h-full w-full rounded-2xl border border-[#303842] bg-[#1b2025] text-center text-3xl font-semibold text-white outline-none transition focus:border-[#8fd8a7] focus:ring-2 focus:ring-[#8fd8a7]/20"
                />
              </motion.div>
            ))
          )}
        </motion.div>

        <div className="min-h-12 text-center text-sm" aria-live="polite">
          {error && <p className="text-[#ff9b9b]">{error}</p>}
          {resendMessage && <p className="text-[#9de5ae]">{resendMessage}</p>}
          {isVerifying && <p className="text-[#8f9aa5]">{t('otp.checking')}</p>}
        </div>

        {!isVerified && (
          <div className="mt-6 text-center text-sm text-[#7d8792]">
            {t('otp.didNotGet')}{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="font-medium text-[#b8e8c4] transition hover:text-white disabled:cursor-not-allowed disabled:text-[#59636d]"
            >
              {isResending ? t('otp.sending') : cooldown > 0 ? t('otp.resendIn', { seconds: cooldown }) : t('otp.resend')}
            </button>
          </div>
        )}
      </motion.div>

      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#22272e] bg-[#121518]/95 px-4 py-2 text-[11px] text-[#77828d] shadow-lg">
        <RotateCcw size={12} className="text-[#9de5ae]" />
        {t('otp.hint')}
      </div>
    </main>
  );
}
