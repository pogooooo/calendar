interface Agreement {
    on(event:'agreementStatusChange',listener:(state:{agreedRequiredTerms:boolean})=>void):void;
    destroy():Promise<void>;
}
export interface TossWidgets {
    setAmount(amount:{value:number;currency:'KRW'}):Promise<void>;
    renderPaymentMethods(options:{selector:string;variantKey:string}):Promise<{destroy():Promise<void>}>;
    renderAgreement(options:{selector:string;variantKey:string}):Promise<Agreement>;
    requestPayment(options:{orderId:string;orderName:string;successUrl:string;failUrl:string}):Promise<void>;
}
declare global {
    interface Window { TossPayments?:(clientKey:string)=>{widgets(options:{customerKey:string}):TossWidgets}; }
}
let loading:Promise<void>|undefined;
export function loadTossScript():Promise<void> {
    if (window.TossPayments) return Promise.resolve();
    if (loading) return loading;
    loading=new Promise<void>((resolve,reject)=>{
        const script=document.createElement('script');
        const timer=window.setTimeout(()=>{script.remove();loading=undefined;reject(new Error('결제 서비스 연결 시간이 초과되었습니다.'));},15000);
        script.src='https://js.tosspayments.com/v2/standard'; script.async=true;
        script.onload=()=>{clearTimeout(timer); if(window.TossPayments) resolve(); else {loading=undefined;reject(new Error('결제 SDK를 불러오지 못했습니다.'));} };
        script.onerror=()=>{clearTimeout(timer);script.remove();loading=undefined;reject(new Error('결제 서비스에 연결하지 못했습니다.'));};
        document.head.appendChild(script);
    });
    return loading;
}
