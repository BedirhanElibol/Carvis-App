import React from "react";
import { Loader2 } from "lucide-react";

const SocialLogins = ({ onSocialLogin, socialLoading }) => {
  return (
    <>
      {/* Social Login Divider */}
      <div className="flex items-center gap-4 my-6 opacity-50">
        <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">
          Veya
        </span>
        <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => onSocialLogin("google")}
          disabled={socialLoading !== null}
          className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3.5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 font-sans cursor-pointer h-12"
        >
          {socialLoading === "google" ? (
            <Loader2 size={18} className="animate-spin text-slate-500 dark:text-slate-400" />
          ) : (
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
          )}
          Google
        </button>
        <button
          type="button"
          onClick={() => onSocialLogin("apple")}
          disabled={socialLoading !== null}
          className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3.5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 font-sans cursor-pointer h-12"
        >
          {socialLoading === "apple" ? (
            <Loader2 size={18} className="animate-spin text-slate-500 dark:text-slate-400" />
          ) : (
            <img
              src="https://www.svgrepo.com/show/511330/apple-173.svg"
              alt="Apple"
              className="w-5 h-5 invert"
            />
          )}
          Apple
        </button>
      </div>
    </>
  );
};

export default SocialLogins;
