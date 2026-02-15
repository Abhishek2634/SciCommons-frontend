'use client';

import Image from 'next/image';
import Link from 'next/link';

import Footer from '@/components/common/Footer';
import NavBar from '@/components/common/NavBar';
import { Button, ButtonTitle } from '@/components/ui/button';

const Home = () => {
  return (
    <div className="relative bg-common-background">
      <NavBar />
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Rebuilt the hero layout with ambient gradients, glass cards, and softer spacing.
          Why: The previous hero was flat and overly white/green.
          How: Added ambient background layers, staggered fades, and modern highlight cards. */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-ambient" />
        <div className="pointer-events-none absolute -left-12 top-24 hidden hero-orb teal float-soft md:block" />
        <div
          className="pointer-events-none absolute -right-20 -top-10 hidden hero-orb blue float-soft md:block"
          style={{ animationDelay: '2s' }}
        />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-16 pt-20 text-center sm:px-10 sm:pt-24">
          <span
            className="fade-up inline-flex items-center gap-2 rounded-full border border-common-contrast/40 bg-common-cardBackground/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-tertiary backdrop-blur"
            style={{ animationDelay: '80ms' }}
          >
            Open science. Clear signals.
          </span>
          <h1
            className="fade-up mt-6 text-4xl font-semibold text-text-primary sm:text-5xl md:text-6xl"
            style={{ animationDelay: '140ms' }}
          >
            Welcome to <span className="text-functional-green">SciCommons</span>
          </h1>
          <p
            className="fade-up mt-4 max-w-2xl text-sm text-text-secondary sm:text-base"
            style={{ animationDelay: '200ms' }}
          >
            Community-driven peer review, transparent metrics, and open access research in one modern
            workspace.
          </p>
          <div
            className="fade-up mt-8 flex flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: '260ms' }}
          >
            <Link href="/articles">
              <Button
                variant={'default'}
                className="w-44 rounded-full bg-gradient-to-r from-functional-green to-functional-blue shadow-lg shadow-functional-green/20 hover:shadow-functional-green/30"
              >
                <ButtonTitle className="text-xs font-semibold tracking-wide">
                  Explore Articles
                </ButtonTitle>
              </Button>
            </Link>
            <Link href="/communities">
              <Button
                variant={'outline'}
                className="w-44 rounded-full border-common-contrast/60 text-text-primary hover:bg-common-minimal/40"
              >
                <ButtonTitle className="text-xs font-semibold tracking-wide">
                  Visit Communities
                </ButtonTitle>
              </Button>
            </Link>
          </div>
          <div
            className="fade-up mt-12 grid w-full gap-4 sm:grid-cols-3"
            style={{ animationDelay: '320ms' }}
          >
            <div className="glass-panel rounded-2xl p-5 text-left">
              <div className="h-1 w-10 rounded-full bg-functional-green/80" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                Open Review
              </p>
              <p className="mt-3 text-sm font-semibold text-text-primary">
                Review research in context.
              </p>
              <p className="mt-2 text-xs text-text-secondary">
                Structured discussions keep feedback focused, fair, and discoverable.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-5 text-left">
              <div className="h-1 w-10 rounded-full bg-functional-blue/80" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                Community Journals
              </p>
              <p className="mt-3 text-sm font-semibold text-text-primary">
                Curate with trusted peers.
              </p>
              <p className="mt-2 text-xs text-text-secondary">
                Build editorial communities and publish with shared standards.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-5 text-left">
              <div className="h-1 w-10 rounded-full bg-functional-yellow/80" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                Transparent Metrics
              </p>
              <p className="mt-3 text-sm font-semibold text-text-primary">
                Signal quality, not hype.
              </p>
              <p className="mt-2 text-xs text-text-secondary">
                Surface engagement and review depth with clarity and trust.
              </p>
            </div>
          </div>
          <div
            className="fade-up mt-12 flex w-full flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8"
            style={{ animationDelay: '380ms' }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
              Our Supporters
            </p>
            <div className="flex flex-col items-center justify-center gap-8 sm:flex-row">
              <Image
                width={160}
                height={40}
                src="/images/KCDHA-White.png"
                alt="KCDHA"
                className="hidden dark:block"
              />
              <Image
                width={160}
                height={40}
                src="/images/KCDHA-Black.png"
                alt="KCDHA"
                className="block dark:hidden"
              />
              <Image
                width={280}
                height={40}
                src="/images/GSoC-White.png"
                alt="GSoC"
                className="hidden dark:block"
              />
              <Image
                width={280}
                height={40}
                src="/images/GSoC-Black.png"
                alt="GSoC"
                className="block dark:hidden"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Introduced a quick-start band with modern cards under the hero.
          Why: The old empty placeholder felt unfinished and added dead space.
          How: Replaced the blank container with three concise action cards. */}
      <section className="relative z-10 bg-common-background">
        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-4 sm:px-10">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-common-contrast/20 bg-common-cardBackground p-6 shadow-common">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                Discover
              </p>
              <h2 className="mt-3 text-lg font-semibold text-text-primary">Browse fresh reviews.</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Explore peer feedback, highlights, and new submissions in one view.
              </p>
            </div>
            <div className="rounded-2xl border border-common-contrast/20 bg-common-cardBackground p-6 shadow-common">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                Collaborate
              </p>
              <h2 className="mt-3 text-lg font-semibold text-text-primary">Join focused communities.</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Follow topic-driven journals and contribute to shared review standards.
              </p>
            </div>
            <div className="rounded-2xl border border-common-contrast/20 bg-common-cardBackground p-6 shadow-common">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                Contribute
              </p>
              <h2 className="mt-3 text-lg font-semibold text-text-primary">Publish with confidence.</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Submit preprints and connect with reviewers who care about rigor.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
