import { createPortal } from "preact/compat";
import { useTranslate } from "@tolgee/react";
import { Consent } from "@unoff/ui";
import type { ConsentConfiguration } from "@unoff/ui";
import webConfig from "../data/webConfig";
import { useAppState } from "../data/AppStateContext";

export function ConsentHost() {
  const { t } = useTranslate();
  const { state, setState } = useAppState();

  if (!state.mustUserConsent) return null;

  const target =
    typeof document !== "undefined" ? document.getElementById("modal") : null;
  if (!target) return null;

  const persistConsent = (consent: Array<ConsentConfiguration>) => {
    setState({ userConsent: consent, mustUserConsent: false });

    window.localStorage.setItem(
      "user_consent_version",
      webConfig.versions.userConsentVersion,
    );
    consent.forEach((item) =>
      window.localStorage.setItem(
        `${item.id}_user_consent`,
        String(item.isConsented),
      ),
    );
  };

  return createPortal(
    <Consent
      welcomeMessage={t("user.cookies.welcome")}
      vendorsMessage={t("user.cookies.vendors")}
      privacyPolicy={{
        label: t("user.cookies.privacyPolicy"),
        action: () => window.open(webConfig.urls.privacyUrl, "_blank"),
      }}
      moreDetailsLabel={t("user.cookies.customize")}
      lessDetailsLabel={t("user.cookies.back")}
      consentActions={{
        consent: { label: t("user.cookies.consent"), action: persistConsent },
        deny: { label: t("user.cookies.deny"), action: persistConsent },
        save: { label: t("user.cookies.save"), action: persistConsent },
      }}
      validVendor={{
        name: t("vendors.functional.name"),
        id: "functional",
        icon: "",
        description: t("vendors.functional.description"),
        isConsented: true,
      }}
      vendorsList={state.userConsent}
      canBeClosed
      closeLabel={t("user.cookies.close")}
      onClose={() => setState({ mustUserConsent: false })}
    />,
    target,
  );
}
