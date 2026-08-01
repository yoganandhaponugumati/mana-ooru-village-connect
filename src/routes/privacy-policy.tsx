import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicyPage } from "./privacy";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy & Data Safety — DigiMitra" },
      {
        name: "description",
        content:
          "Official Privacy Policy and Google Play Data Safety disclosure for the DigiMitra Digital Village Ecosystem.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});
