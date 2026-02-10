'use client';

import Image from 'next/image';
import Link from 'next/link';

import Footer from '@/components/common/Footer';
import NavBar from '@/components/common/NavBar';
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from '@/components/ui/accordian';
import { Button, ButtonTitle } from '@/components/ui/button';
// import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';

// import { faqs } from '@/constants/common.constants';

// import FeaturesSection from './FeaturesSection';

const Home = () => {
  // const words = [
  //   {
  //     text: 'Welcome',
  //   },
  //   {
  //     text: 'to',
  //   },
  //   {
  //     text: 'SciCommons.',
  //     className: 'text-functional-green',
  //   },
  // ];

  return (
    <div className="relative bg-common-background">
      <NavBar />
      {/* <Banner /> */}
      {/* Fixed by Codex on 2026-02-10
          Problem: The hero container enforced extra empty space below the supporters row.
          Solution: Removed the forced minimum height so the hero hugs its content.
          Result: The hero now ends right after "Our Supporters" without a blank tail. */}
      <div className="relative inset-0 z-0 -mt-6 flex flex-col items-center justify-center overflow-hidden rounded-t-3xl bg-common-background">
        <Image
          src={'/images/assets/gradient.webp'}
          fill
          alt=""
          className="z-0 opacity-10 invert dark:invert-0"
          quality={10}
        />
        {/* Fixed by Codex on 2026-02-10
            Problem: The hero content was sitting too high and overlapping the navbar.
            Solution: Added top padding to the hero content wrapper to push the group down.
            Result: The title and CTAs clear the navbar without changing layout elsewhere. */}
        <div className="z-10 -mt-6 flex w-full flex-col items-center justify-center backdrop-blur-xl pt-14 sm:pt-20">
          <div className="flex w-full flex-col items-center justify-center pb-0">
            {/* Fixed by Codex on 2026-02-10
                Problem: The hero title used a typewriter animation with a cursor line that felt like a movie-style effect.
                Solution: Commented out the animated component and replaced it with a static heading using the same colors.
                Result: "Welcome to SciCommons" renders normally without the green cursor line. */}
            <h1 className="mb-1 text-center text-3xl font-bold text-text-primary sm:text-4xl md:text-5xl">
              Welcome to <span className="text-functional-green">SciCommons.</span>
            </h1>
            {/* <TypewriterEffectSmooth words={words} /> */}
            {/* Moved to about page */}
            {/* <p className="mb-6 max-w-3xl px-4 text-center text-xs text-text-secondary sm:text-sm">
              Be part of the change. Join our open platform to review, rate, and access research
              freely. Improve research quality and accessibility with community-driven peer review.
            </p> */}
            {/* Fixed by Codex on 2026-02-10
                Problem: Primary CTA buttons sat too close to the hero title.
                Solution: Added top margin to the CTA row to increase vertical spacing.
                Result: Clearer separation between the title and action buttons. */}
            <div className="mt-6 flex flex-row items-center space-x-4">
              <Link href="/articles">
                <Button variant={'gray'} className="w-40 bg-black text-white dark:text-white">
                  <ButtonTitle>Explore Articles</ButtonTitle>
                </Button>
              </Link>
              <Link href="/communities">
                <Button className="w-40">
                  <ButtonTitle>Visit Communities</ButtonTitle>
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex w-full flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
              <p className="text-sm font-bold text-text-secondary md:text-base">
                Our Supporters
              </p>
              <div className="flex flex-col items-center justify-center gap-8 sm:flex-row">
                {/* KCDHA Logo - CSS-based theme switching */}
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
                {/* GSoC Logo - CSS-based theme switching */}
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
        </div>
      </div>
      {/* Fixed by Codex on 2026-02-10
          Problem: Need a dedicated area between the hero and footer for future feed content.
          Solution: Inserted a placeholder section outside the hero to reserve layout space.
          Result: Supporters stay in the hero while a new blank container separates hero and footer. */}
      <section className="relative z-20 bg-common-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10 md:px-12">
          <div className="h-[220px] rounded-2xl border border-common-contrast/20 bg-common-background/60" />
        </div>
      </section>
      {/* Featured Video section moved to /help page */}
      {/* <div className="relative z-20 -mt-16 rounded-t-3xl bg-common-background px-12 pb-20 pt-1">
        <p className="w-full pb-3 text-center text-sm font-bold text-text-secondary md:text-base">
          Featured Video
        </p>
        <div className="flex w-full flex-col items-center justify-center">
          <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg border-2 border-functional-greenContrast/20">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/6U-XS_kjvmc"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            ></iframe>
          </div>
        </div>
      </div> */}
      {/*
        Features section commented out for now — keep markup for future re-enable

      <div className="relative z-30 -mt-8 h-fit w-full rounded-t-3xl bg-[#E3F2E9] pb-20 dark:bg-[#0F1E15]">
        <div className="flex w-full flex-col items-center py-8">
          <span className="text-center text-xl font-bold text-functional-green md:text-2xl">
            Features
          </span>
          <span className="text-base text-text-secondary">Uniqueness of our platform</span>
        </div>
        <FeaturesSection />
      </div>
      */}
      {/*
        FAQ section commented out for now — keep markup for future re-enable

      <div className="relative z-40 -mt-8 flex w-full flex-col items-center rounded-t-3xl bg-common-background py-12">
        <span className="px-8 text-center text-xl font-bold text-text-primary md:text-2xl">
          We Have Answered Almost All Your Questions
        </span>
        <div className="mt-8 flex w-full max-w-[95%] flex-col items-center p-4 md:max-w-[80%]">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                className="w-full border-b border-common-contrast px-0 py-1"
                key={i}
                value={faq?.ques}
              >
                <AccordionTrigger className="w-full p-5" defaultIconNeeded={true}>
                  <span className="w-full text-left text-sm text-text-primary md:text-base">
                    {faq?.ques}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-0">
                  <span className="text-xs text-text-secondary md:text-sm">{faq?.ans}</span>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      */}
      <Footer />
    </div>
  );
};

export default Home;
