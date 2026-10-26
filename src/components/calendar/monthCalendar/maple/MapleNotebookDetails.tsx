import * as S from './MapleNotebookDetails.styles';

export default function MapleNotebookDetails({ month }: { month:Date }) {
    return <S.Colophon aria-hidden="true" data-calendar-etching="maple">
        <span>CRONOS · PLANNING JOURNAL</span><span className="folio">{String(month.getMonth()+1).padStart(2,'0')}</span>
    </S.Colophon>;
}
