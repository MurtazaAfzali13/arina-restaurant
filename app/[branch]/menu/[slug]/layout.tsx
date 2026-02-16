import { ReactNode } from "react";

type PlayerLayoutProps = {
  children: ReactNode; // the main content
  modal?: ReactNode;   // optional modal overlay
};

export default function PlayerLayout({ children, modal }: PlayerLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

