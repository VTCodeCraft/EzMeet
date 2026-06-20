import { SignIn } from "@clerk/react";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/routes/common/routePaths";

const SignInPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <SignIn
        routing="path"
        path={AUTH_ROUTES.SIGN_IN}
        signUpUrl={AUTH_ROUTES.SIGN_UP}
        forceRedirectUrl={PROTECTED_ROUTES.EVENT_TYPES}
      />
    </div>
  );
};

export default SignInPage;