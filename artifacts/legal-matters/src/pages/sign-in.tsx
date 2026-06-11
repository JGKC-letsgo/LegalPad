import React from "react";
import { SignIn } from "@clerk/react";
import { shadcn } from "@clerk/themes";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#7C5CBF",
    colorForeground: "#1A1723",
    colorMutedForeground: "#6b7280",
    colorDanger: "#ef4444",
    colorBackground: "#ffffff",
    colorInput: "#f5f3ff",
    colorInputForeground: "#1A1723",
    colorNeutral: "#e5e1f0",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.3rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-xl w-[440px] max-w-full overflow-hidden shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-serif text-[#1A1723]",
    headerSubtitle: "text-[#6b7280]",
    socialButtonsBlockButtonText: "text-[#1A1723]",
    formFieldLabel: "text-[#1A1723]",
    footerActionLink: "text-[#7C5CBF]",
    footerActionText: "text-[#6b7280]",
    dividerText: "text-[#6b7280]",
    identityPreviewEditButton: "text-[#7C5CBF]",
    formFieldSuccessText: "text-green-600",
    alertText: "text-[#1A1723]",
    logoBox: "flex justify-center",
    logoImage: "h-10",
    socialButtonsBlockButton: "border border-[#e5e1f0] bg-white",
    formButtonPrimary: "bg-[#7C5CBF] hover:bg-[#6b4fa8]",
    formFieldInput: "bg-[#f5f3ff] border-[#e5e1f0] text-[#1A1723]",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#e5e1f0]",
    alert: "bg-red-50 border-red-200",
    otpCodeFieldInput: "border-[#e5e1f0] bg-[#f5f3ff]",
    formFieldRow: "gap-2",
    main: "gap-4",
  },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <img src={`${basePath}/logo.svg`} alt="Legalpad" className="h-12 w-auto mb-4" />
      </div>
      <SignIn routing="path" path={`${basePath}/sign-in`} appearance={clerkAppearance} />
    </div>
  );
}
