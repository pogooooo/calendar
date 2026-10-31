/** Public responder URL only. The form and response sheet are owned by HaluStudio. */
export const ANDROID_TEST_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfKZ9p-2_CGBDIVR2QyFtXDM6q37Yordk1NSQM_bHe5orZDrA/viewform';
export const ANDROID_TEST_FORM_EMBED_URL = ANDROID_TEST_FORM_URL + '?embedded=true';
export const ANDROID_TEST_URL = 'https://play.google.com/apps/testing/com.cronos.todoapp';
export const ANDROID_STORE_URL = 'https://play.google.com/store/apps/details?id=com.cronos.todoapp';
const DESTINATIONS = { test: ANDROID_TEST_URL, store: ANDROID_STORE_URL };

/** Forms collects applications; the operator adds testers manually before Play opt-in. */
export function androidTestingUrl(destination: keyof typeof DESTINATIONS, email = ''): string {
    const url = new URL(DESTINATIONS[destination]);
    const account = email.trim().toLowerCase();
    if (account.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)) url.searchParams.set('authuser', account);
    return url.toString();
}
