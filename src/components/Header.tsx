import { Link, useNavigate } from 'react-router-dom';

type Props = {
    bookTag?: string;
    backTo?: string | null;
};

export default function Header({ bookTag, backTo }: Props) {
    const navigate = useNavigate();
    return (
        <div className="leanlingo-header">
            {backTo === null ? (
                <span style={{ width: 56 }} />
            ) : (
                <button
                    className="leanlingo-back"
                    onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                    aria-label="back"
                >
                    ← back
                </button>
            )}
            <Link to="/" className="leanlingo-wordmark">LeanLingo</Link>
            <span className="leanlingo-book-tag">{bookTag ?? ''}</span>
        </div>
    );
}
