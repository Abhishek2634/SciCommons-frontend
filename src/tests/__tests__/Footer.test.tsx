import React from 'react';

import { render, screen } from '@testing-library/react';

import Footer from '@/components/common/Footer';

// Mock the next/link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('next/image', () => {
  const MockImage = ({ alt }: { alt?: string }) => <span aria-label={alt ?? 'image'} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />);
  });

  it('displays all navigation links', () => {
    render(<Footer />);
    const links = ['Home', 'Articles', 'Communities', 'About', 'Login', 'Register', 'Docs'];
    links.forEach((link) => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });

  it('displays copyright information', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2024 SciCommons. All rights reserved./)).toBeInTheDocument();
  });

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Removed footer social/policy link assertions.
     Why: The UI intentionally hides these dead links.
     How: Keep coverage to visible content only. */

  it('applies correct CSS classes for light mode', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-functional-green/10');
  });

  // Note: Testing dark mode might require additional setup or a different approach
  // as it often depends on a theme context or CSS variables
});
