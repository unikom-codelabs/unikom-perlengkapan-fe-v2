import React from "react";
import PageHelmet from "../components/Seo/PageHelmet";
import AuthLayout from "../components/Layouts/AuthLayout";
import FormLogin from "../components/Fragments/FormLogin";

const LoginPage = () => {
  return (
    <>
      <PageHelmet
        title="Login"
        description="Masuk ke aplikasi UNIKOM Perlengkapan."
      />
      <AuthLayout>
        <FormLogin />
      </AuthLayout>
    </>
  );
};

export default LoginPage;
