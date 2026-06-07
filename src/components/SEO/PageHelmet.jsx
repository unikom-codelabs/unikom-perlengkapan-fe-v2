import { Helmet } from "react-helmet-async";

const APP_NAME = "UNIKOM Perlengkapan";
const DEFAULT_DESCRIPTION =
  "Aplikasi pengelolaan pengajuan dan perlengkapan di lingkungan UNIKOM.";

const buildTitle = (title) => {
  const pageTitle = String(title ?? "").trim();

  if (!pageTitle) {
    return APP_NAME;
  }

  return pageTitle.includes(APP_NAME)
    ? pageTitle
    : `${pageTitle} | ${APP_NAME}`;
};

const PageHelmet = ({ title, description = DEFAULT_DESCRIPTION }) => {
  const fullTitle = buildTitle(title);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default PageHelmet;
