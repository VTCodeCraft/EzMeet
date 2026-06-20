import { SignUp } from "@clerk/react";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/routes/common/routePaths";

const SignUpPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <SignUp
        routing="path"
        path={AUTH_ROUTES.SIGN_UP}
        signInUrl={AUTH_ROUTES.SIGN_IN}
        forceRedirectUrl={PROTECTED_ROUTES.EVENT_TYPES}
      />
    </div>
  );
};

export default SignUpPage;