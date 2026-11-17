import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Info, Check, Download, Sparkles } from 'lucide-react';
import { FanMessage, SEED_FAN_MESSAGES } from '../../data/dhoniData';
import { audioEngine } from '../../utils/audioEngine';

const STORAGE_KEY = 'the_last_innings_tribute_wall_v1';

const ERA_CHOICES = [
  '2011 Wankhede · 91*',
  '2010 Dharamsala · 54*',
  '2018 Comeback Crown',
  '2023 Fifth IPL Trophy',
];

function downloadFanPassPng(name: string, city: string, moment: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Sunlit bright yellow & clean white editorial card
  const bg = ctx.createLinearGradient(0, 0, 1080, 1350);
  bg.addColorStop(0, '#FFFFFF');
  bg.addColorStop(0.55, '#FAF8F2');
  bg.addColorStop(1, '#FFF3B0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1350);

  // Top & Bottom bright CSK Yellow bands
  ctx.fillStyle = '#FFD60A';
  ctx.fillRect(0, 0, 1080, 26);
  ctx.fillRect(0, 1324, 1080, 26);

  // Architectural border frame
  ctx.strokeStyle = '#0B0D12';
  ctx.lineWidth = 4;
  ctx.strokeRect(56, 66, 968, 1218);

  // Giant Ghost 07 watermark
  ctx.fillStyle = 'rgba(255, 214, 10, 0.34)';
  ctx.font = '700 420px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('07', 540, 740);

  // Header Badge
  ctx.fillStyle = '#0B0D12';
  ctx.fillRect(300, 125, 480, 56);
  ctx.fillStyle = '#FFD60A';
  ctx.font = '700 22px monospace';
  ctx.fillText('YELLOW ARMY · OFFICIAL PASS', 540, 161);

  // Title
  ctx.fillStyle = '#0B0D12';
  ctx.font = '700 66px Georgia, serif';
  ctx.fillText('THE LAST INNINGS.', 540, 290);

  ctx.fillStyle = '#B37800';
  ctx.font = 'italic 30px Georgia, serif';
  ctx.fillText("The Match Ends. The Legacy Doesn't.", 540, 345);

  // Member Details
  ctx.fillStyle = '#525661';
  ctx.font = '600 20px monospace';
  ctx.fillText('ISSUED TO SUPPORTER', 540, 520);

  ctx.fillStyle = '#0B0D12';
  ctx.font = '700 60px Georgia, serif';
  ctx.fillText(name.toUpperCase(), 540, 595);

  ctx.fillStyle = '#B37800';
  ctx.font = '600 26px monospace';
  ctx.fillText((city || 'CHENNAI · WORLDWIDE').toUpperCase(), 540, 648);

  // Chosen Iconic Moment Pill
  ctx.fillStyle = '#FFD60A';
  ctx.fillRect(190, 740, 700, 96);
  ctx.fillStyle = '#0B0D12';
  ctx.font = '700 20px monospace';
  ctx.fillText('FAVORITE THALA MOMENT', 540, 777);
  ctx.font = '700 30px Georgia, serif';
  ctx.fillText(moment, 540, 818);

  // Stats Row
  ctx.fillStyle = '#0B0D12';
  ctx.font = '700 44px Georgia, serif';
  ctx.fillText('5 IPL  ·  3 ICC  ·  NO. 07', 540, 975);

  // Footer Credit
  ctx.fillStyle = '#525661';
  ctx.font = '600 20px monospace';
  ctx.fillText('MADE WITH LOVE BY SUMYA WEB STUDIO', 540, 1185);
  ctx.fillStyle = '#B37800';
  ctx.fillText('@SUMYA.WEB.STUDIO', 540, 1222);

  const link = document.createElement('a');
  link.download = `thala-07-pass-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'fan'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export const FanTributeWall: React.FC = () => {
  const [messages, setMessages] = useState<FanMessage[]>(SEED_FAN_MESSAGES);
  const [author, setAuthor] = useState('');
  const [city, setCity] = useState('');
  const [messageText, setMessageText] = useState('');
  const [favoriteEra, setFavoriteEra] = useState(ERA_CHOICES[0]);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FanMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages([...parsed, ...SEED_FAN_MESSAGES]);
        }
      }
    } catch {
      // Ignore storage read errors in restricted browsing modes
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAuthor = author.trim();
    const trimmedCity = city.trim();
    const trimmedMsg = messageText.trim();
    if (!trimmedAuthor || !trimmedMsg) return;

    const newEntry: FanMessage = {
      id: `local-${Date.now()}`,
      author: trimmedAuthor,
      city: trimmedCity || 'Yellow Army Worldwide',
      jerseyNumber: '07',
      message: trimmedMsg,
      createdAt: 'Saved locally in your browser',
      isSeed: false,
    };

    const updatedAll = [newEntry, ...messages];
    setMessages(updatedAll);

    try {
      const userOnly = updatedAll.filter((m) => !m.isSeed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
    } catch {
      // Ignore quota errors
    }

    audioEngine.playStampTribute();
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 3500);
  };

  const displayName = author.trim() || 'YELLOW ARMY FAN';
  const displayCity = city.trim() || 'CHEPAUK · WORLDWIDE';

  return (
    <div className="mt-16 space-y-12">
      {/* Shareable Instagram #07 Fan Pass Generator */}
      <div className="grid grid-cols-1 items-center gap-8 border-2 border-[#FFD60A] bg-white p-6 shadow-[0_24px_64px_rgba(255,214,10,0.22)] sm:p-10 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-6">
          <div className="inline-flex items-center gap-2 bg-[#FFD60A] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0B0D12]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Instagram Story Ready · 1080×1350</span>
          </div>
          <h3 className="font-serif text-3xl font-normal text-[#0B0D12] sm:text-4xl">
            Claim Your <span className="italic text-[#D99600]">#07 Yellow Army Pass</span>
          </h3>
          <p className="font-sans text-sm text-[#525661]">
            Customize with your name, city, and favorite Dhoni moment, then download a crisp card
            to share on Instagram.
          </p>

          <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
            {ERA_CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => {
                  setFavoriteEra(choice);
                  audioEngine.playSubtlePulse(440);
                }}
                className={`border px-3.5 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] transition-all ${
                  favoriteEra === choice
                    ? 'border-[#0B0D12] bg-[#FFD60A] text-[#0B0D12]'
                    : 'border-[#0B0D12]/15 bg-[#FAF8F2] text-[#525661] hover:border-[#FFD60A]'
                }`}
              >
                {choice}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              audioEngine.playStampTribute();
              downloadFanPassPng(displayName, displayCity, favoriteEra);
            }}
            className="mt-3 inline-flex items-center gap-2.5 bg-[#0B0D12] px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFD60A] shadow-lg transition-transform hover:scale-[1.02]"
          >
            <Download className="h-4 w-4" />
            <span>Download #07 Story Pass (PNG)</span>
          </button>
        </div>

        {/* Live Pass Preview Card */}
        <div className="flex justify-center lg:col-span-6">
          <div className="relative w-full max-w-[340px] overflow-hidden border-2 border-[#0B0D12] bg-gradient-to-br from-[#FFFFFF] via-[#FAF8F2] to-[#FFF2A6] p-6 text-center shadow-[0_24px_60px_rgba(11,13,18,0.16)]">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[170px] font-bold text-[#FFD60A]/30 select-none">
              07
            </div>
            <div className="relative z-10 space-y-3">
              <div className="inline-block bg-[#0B0D12] px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#FFD60A]">
                Yellow Army · Official Pass
              </div>
              <div className="font-display text-xl font-semibold tracking-[0.16em] text-[#0B0D12]">
                THE LAST INNINGS.
              </div>
              <div className="border-y border-[#0B0D12]/15 py-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#525661]">
                  Issued To
                </div>
                <div className="mt-1 truncate font-serif text-2xl font-semibold text-[#0B0D12]">
                  {displayName}
                </div>
                <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B37800]">
                  {displayCity}
                </div>
              </div>
              <div className="bg-[#FFD60A] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#0B0D12]">
                {favoriteEra}
              </div>
              <div className="pt-1 font-mono text-[8.5px] uppercase tracking-[0.2em] text-[#525661]">
                @sumya.web.studio
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tribute Form + Voices Wall */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="border border-[#0B0D12]/10 bg-white p-6 shadow-[0_20px_56px_rgba(11,13,18,0.08)] sm:p-8 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#0B0D12]/10 pb-4">
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-[#B37800]">
                Leave a Tribute for Thala
              </span>
              <h3 className="mt-1 font-serif text-2xl text-[#0B0D12]">Sign the Yellow Wall</h3>
            </div>
            <span className="bg-[#FFD60A] px-2.5 py-1 font-display text-xl font-bold text-[#0B0D12]">
              #07
            </span>
          </div>

          <div className="mt-4 flex items-start gap-2.5 border border-[#FFD60A]/60 bg-[#FFD60A]/15 p-3 text-[11px] leading-relaxed text-[#525661]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B37800]" />
            <span>
              Interactive Demo Mode: Tributes posted here are stored locally in your browser (
              <code className="font-semibold text-[#0B0D12]">localStorage</code>) and are not
              broadcast to an external server.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fan-name"
                  className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#525661]"
                >
                  Your Name *
                </label>
                <input
                  id="fan-name"
                  type="text"
                  required
                  maxLength={48}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Arjun Narayanan"
                  className="mt-1.5 w-full border border-[#0B0D12]/15 bg-[#FAF8F2] px-3.5 py-2.5 font-sans text-sm text-[#0B0D12] placeholder-[#525661]/50 transition-colors focus:border-[#FFD60A] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="fan-city"
                  className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#525661]"
                >
                  City / Stand
                </label>
                <input
                  id="fan-city"
                  type="text"
                  maxLength={42}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chennai / Ranchi"
                  className="mt-1.5 w-full border border-[#0B0D12]/15 bg-[#FAF8F2] px-3.5 py-2.5 font-sans text-sm text-[#0B0D12] placeholder-[#525661]/50 transition-colors focus:border-[#FFD60A] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="fan-message"
                className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#525661]"
              >
                Message to MS Dhoni *
              </label>
              <textarea
                id="fan-message"
                required
                rows={4}
                maxLength={280}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write a memory, a match night, or a thank you for No. 7..."
                className="mt-1.5 w-full resize-none border border-[#0B0D12]/15 bg-[#FAF8F2] px-3.5 py-2.5 font-sans text-sm text-[#0B0D12] placeholder-[#525661]/50 transition-colors focus:border-[#FFD60A] focus:bg-white focus:outline-none"
              />
              <div className="mt-1 text-right font-mono text-[10px] text-[#525661]">
                {messageText.length}/280
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2.5 bg-[#FFD60A] px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0B0D12] shadow-[0_10px_28px_rgba(255,214,10,0.4)] transition-all hover:bg-[#FFE63B]"
            >
              {submittedNotice ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Added to Local Tribute Wall</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Inscribe Tribute</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tribute Messages Stream */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-[#525661]">
            <span>Voices From the Stands</span>
            <span className="text-[#B37800]">{messages.length} Tributes Displayed</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AnimatePresence initial={false}>
              {messages.slice(0, 6).map((item) => (
                <motion.article
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`flex flex-col justify-between border p-5 shadow-sm ${
                    item.isSeed
                      ? 'border-[#0B0D12]/10 bg-white'
                      : 'border-[#FFD60A] bg-[#FFD60A]/15'
                  }`}
                >
                  <p className="font-serif text-lg leading-relaxed text-[#0B0D12]">
                    &ldquo;{item.message}&rdquo;
                  </p>

                  <div className="mt-5 flex items-end justify-between border-t border-[#0B0D12]/10 pt-3">
                    <div>
                      <div className="font-sans text-xs font-semibold text-[#0B0D12]">
                        {item.author}
                      </div>
                      <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#B37800]">
                        {item.city}
                      </div>
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#525661]">
                      {item.createdAt}
                    </span>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
