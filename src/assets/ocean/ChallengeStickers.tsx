import * as S from './ChallengeStickers.styles';
import { memo } from 'react';
export const CrescentMoonAndLineIndicator = ({className=''}: {width?:string;height?:string;className?:string}) => <S.Sticker className={className} $filled={false} aria-hidden="true" viewBox="0 0 52 52"><path d="M26 43 8 22q-3-6 3-7-1-8 7-8 4-8 8-3 4-5 8 3 8 0 7 8 6 1 3 7Z" /><path d="M26 43 11 15m15 28L18 7m8 36V4m0 39 8-36m-8 36 15-28" /></S.Sticker>;
export const SparkleIndicator = ({className=''}: {width?:string;height?:string;className?:string}) => <S.Sticker className={className} $filled aria-hidden="true" viewBox="0 0 52 52"><path d="M26 43 8 22q-3-6 3-7-1-8 7-8 4-8 8-3 4-5 8 3 8 0 7 8 6 1 3 7Z" /><path d="M26 43 11 15m15 28L18 7m8 36V4m0 39 8-36m-8 36 15-28" /><circle cx="26" cy="39" r="3" /></S.Sticker>;
export const DynamicSticker = memo(function OceanSticker({isFilled}: {isFilled:boolean;idx:number}) { return isFilled ? <SparkleIndicator /> : <CrescentMoonAndLineIndicator />; });
