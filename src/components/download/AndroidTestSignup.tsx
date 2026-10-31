"use client";
import { useId, useState } from 'react';
import Link from 'next/link';
import useSettingStore from '@/store/useSettingStore';
import { ANDROID_TEST_FORM_URL, ANDROID_TEST_FORM_EMBED_URL, androidTestingUrl } from '@/lib/androidTesting';
import * as S from './AndroidTestSignup.styles';

/** Google confirms receipt; opening the form never means the application was received or approved. */
export default function AndroidTestSignup() {
    const english = useSettingStore(state=>state.locale) === 'en';
    const [formOpen,setFormOpen] = useState(false);
    const [formLoaded,setFormLoaded] = useState(false);
    const id = useId();
    const copy = english ? {
        badge:'ANDROID · CLOSED TEST', title:'Apply for the Android closed test',
        intro:'CRONOS is currently in closed testing on Google Play. Apply with the email you use on Google Play. We will email you when registration is complete.',
        one:'1. Submit your email', open:'Open the application form', close:'Hide application form', external:'Open Google Form in a new tab',
        help:'Enter your Google Play account email in the form below. A CRONOS account is not required. The form itself is provided in Korean.',
        privacy:'The form collects your email and consent through Google Forms. Responses are available to HaluStudio for tester registration and follow-up, and are deleted when the closed test ends or you withdraw.',
        notice:'After applying, wait for your registration confirmation email. Applying alone does not grant installation access.',
        two:'2. Check your confirmation email and join', test:'Open test participation',
        testHelp:'Once you receive the confirmation email, open the page below with the Google account you applied with and select “Become a tester”.',
        three:'3. Install CRONOS', install:'Open Google Play',
        installHelp:'After joining the test, install the app from Google Play using the same Google account.',
        policy:'Privacy policy', contact:'Questions or email corrections: ',
    } : {
        badge:'ANDROID · 비공개 테스트', title:'Android 비공개 테스트 신청',
        intro:'CRONOS는 현재 Google Play 비공개 테스트 중입니다. Google Play에서 사용하는 이메일로 신청해 주세요. 등록이 끝나면 이메일로 알려드립니다.',
        one:'1. 이메일로 참여 신청', open:'이메일 신청서 열기', close:'신청서 접기', external:'Google 폼을 새 창에서 열기',
        help:'아래 신청서에 Google Play 계정 이메일을 입력해 주세요. CRONOS 회원가입은 필요하지 않습니다.',
        privacy:'이메일과 수집·이용 동의는 Google Forms로 접수됩니다. HaluStudio가 신청 확인·테스터 등록·완료 알림에 사용하며, 비공개 테스트 종료 또는 신청 철회 시 삭제합니다.',
        notice:'신청 후 등록 완료 이메일을 기다려 주세요. 신청만으로 바로 설치할 수는 없습니다.',
        two:'2. 등록 완료 이메일 확인 후 참여', test:'테스트 참여 페이지 열기',
        testHelp:'등록 완료 이메일을 받았다면, 신청한 Google 계정으로 아래 페이지에서 ‘테스터 되기’를 선택해 주세요.',
        three:'3. CRONOS 설치', install:'Google Play에서 설치',
        installHelp:'테스트 참여를 마친 같은 Google 계정으로 Google Play에서 앱을 설치해 주세요.',
        policy:'개인정보처리방침', contact:'문의·이메일 정정·신청 철회: ',
    };
    return <S.Panel id="android-test" aria-labelledby={`${id}-title`}>
        <S.Badge>{copy.badge}</S.Badge><h2 id={`${id}-title`}>{copy.title}</h2><p>{copy.intro}</p>
        <S.Step>
            <h3>{copy.one}</h3>
            {!formOpen && <>
                <p>{copy.help}</p>
                <S.Small>{copy.privacy} <Link href="/privacy">{copy.policy}</Link></S.Small>
                <S.Notice>{copy.notice}</S.Notice>
            </>}
            <S.Actions>
                <S.Button type="button" aria-expanded={formOpen} aria-controls={`${id}-form`} onClick={()=>{setFormLoaded(true);setFormOpen(!formOpen);}}>{formOpen ? copy.close : copy.open}</S.Button>
                <a href={ANDROID_TEST_FORM_URL} target="_blank" rel="noopener noreferrer">{copy.external}</a>
            </S.Actions>
            <S.FormFrame id={`${id}-form`} hidden={!formOpen}>
                {formLoaded && <iframe src={ANDROID_TEST_FORM_EMBED_URL} title={english ? 'CRONOS Android tester email application' : 'CRONOS Android 테스터 이메일 신청서'} referrerPolicy="no-referrer" />}
            </S.FormFrame>
        </S.Step>
        <S.Step><h3>{copy.two}</h3><p>{copy.testHelp}</p><S.Actions><S.Button as="a" href={androidTestingUrl('test')} target="_blank" rel="noopener noreferrer">{copy.test}</S.Button></S.Actions></S.Step>
        <S.Step><h3>{copy.three}</h3><p>{copy.installHelp}</p><S.Actions><S.Button as="a" href={androidTestingUrl('store')} target="_blank" rel="noopener noreferrer">{copy.install}</S.Button></S.Actions></S.Step>
        <S.Small>{copy.contact}<a href="mailto:cronos.support@gmail.com">cronos.support@gmail.com</a></S.Small>
    </S.Panel>;
}
