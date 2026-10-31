import { notFound } from 'next/navigation';
import DesignStudio from './DesignStudio';

export default function DesignPreviewPage() {
    if (process.env.NODE_ENV !== 'development') notFound();
    return <DesignStudio />;
}
