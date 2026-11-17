export type XpIconKind =
  | 'computer'
  | 'folder'
  | 'notebook'
  | 'mail'
  | 'recycle'
  | 'notepad'
  | 'file'
  | 'run'
  | 'power'
  | 'logoff'
  | 'docs'

/** Original drawings in the spirit of the 2001 icon set: soft gradients, a dark outline. */
export function XpIcon({ kind, size = 52 }: { kind: XpIconKind; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden="true">
      {kind === 'computer' ? (
        <>
          <path d="M8 5h46v36H8z" fill="#dbe6f5" stroke="#1e4587" strokeWidth="2" />
          <path d="M13 10h36v25H13z" fill="#155bbd" />
          <path d="M14 31 29 14l20 11v10H14z" fill="#79b963" />
          <path d="M14 11h34v7L14 31z" fill="#82c9fa" opacity=".55" />
          <path d="M26 42h12v9H26z" fill="#abbad1" stroke="#1e4587" />
          <path d="M18 49h28v6H18zM8 58h47l4 4H4z" fill="#e9edf1" stroke="#1e4587" />
          <path d="M12 60h39" stroke="#8799b3" strokeDasharray="3 2" />
        </>
      ) : kind === 'folder' ? (
        <>
          <path d="M5 18V12h21l6 6h24v37H5z" fill="#e5a620" stroke="#985e09" strokeWidth="2" />
          <path d="M5 23h55l-7 32H5z" fill="#ffdc65" stroke="#985e09" strokeWidth="2" />
          <path d="M8 26h48l-2 6H8z" fill="#fff3b2" />
          <path d="M9 48h40" stroke="#e6b338" strokeWidth="2" />
        </>
      ) : kind === 'notebook' ? (
        <>
          <circle cx="32" cy="32" r="25" fill="#3d8de0" stroke="#1d4f99" strokeWidth="2" />
          <path
            d="M9 30h46M32 7c-9 8-9 42 0 50M32 7c9 8 9 42 0 50"
            stroke="#bfe0ff"
            strokeWidth="2"
          />
          <path d="M14 18c10 5 26 5 36 0M14 46c10-5 26-5 36 0" stroke="#bfe0ff" strokeWidth="2" />
          <path d="M6 40c18-26 42-30 54-22-6-8-36-2-54 22z" fill="#f7c435" stroke="#b07a10" />
        </>
      ) : kind === 'mail' ? (
        <>
          <path d="M4 17h56v37H4z" fill="#fff8d3" stroke="#a77b23" strokeWidth="2" />
          <path d="m5 51 21-18M59 51 38 33" stroke="#d9b965" strokeWidth="2" />
          <path d="m5 18 27 22 27-22" fill="#fffceb" stroke="#a77b23" strokeWidth="2" />
          <path d="M45 5h14v14H45z" fill="#408ddd" stroke="#245ba0" />
          <path d="m47 10 4 3 5-5" stroke="#fff" strokeWidth="2" />
        </>
      ) : kind === 'recycle' ? (
        <>
          <path d="M14 16h36l-4 42H18z" fill="#dfe9f2" stroke="#4d6d8f" strokeWidth="2" />
          <path d="M10 12h44v6H10z" fill="#c7d6e6" stroke="#4d6d8f" strokeWidth="2" />
          <path d="M22 24l2 28M32 24v28M42 24l-2 28" stroke="#9fb6cd" strokeWidth="2" />
          <path d="M24 7c3-4 13-4 16 0" stroke="#4d6d8f" strokeWidth="2" />
          <path d="M20 34h10v8H20z" fill="#fff" stroke="#9aa9b8" transform="rotate(-14 25 38)" />
          <path d="M33 30h11v9H33z" fill="#ffe28a" stroke="#c19b2c" transform="rotate(10 38 35)" />
        </>
      ) : kind === 'notepad' || kind === 'file' ? (
        <>
          <path d="M14 5h28l10 10v44H14z" fill="#fff" stroke="#4f6a8a" strokeWidth="2" />
          <path d="M42 5v10h10" fill="#dfe8f2" stroke="#4f6a8a" strokeWidth="2" />
          <path
            d="M20 24h24M20 31h24M20 38h24M20 45h16"
            stroke={kind === 'notepad' ? '#4b86c6' : '#9fb0c4'}
            strokeWidth="2"
          />
          {kind === 'notepad' ? <path d="M14 5h6v54h-6z" fill="#7fb3e6" /> : null}
        </>
      ) : kind === 'run' ? (
        <>
          <path d="M6 14h52v38H6z" fill="#eef3fa" stroke="#3c5f8f" strokeWidth="2" />
          <path d="M6 14h52v8H6z" fill="#2d6fd6" />
          <path d="m18 32 8 6-8 6M30 44h14" stroke="#1c3c66" strokeWidth="3" />
        </>
      ) : kind === 'power' ? (
        <>
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="10"
            fill="#e8492c"
            stroke="#9c2510"
            strokeWidth="2"
          />
          <path d="M32 16v16" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          <path d="M22 22a14 14 0 1 0 20 0" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : kind === 'logoff' ? (
        <>
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="10"
            fill="#f0a830"
            stroke="#a46a0d"
            strokeWidth="2"
          />
          <path d="M22 14h20v36H22z" fill="#fff4d6" />
          <path d="M30 32h22m-7-7 7 7-7 7" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M5 18V12h21l6 6h24v37H5z" fill="#e5a620" stroke="#985e09" strokeWidth="2" />
          <path d="M18 8h30v40H18z" fill="#fff" stroke="#6b7f97" />
          <path d="M23 16h20M23 22h20M23 28h14" stroke="#9fb0c4" strokeWidth="2" />
          <path d="M5 30h55l-7 25H5z" fill="#ffdc65" stroke="#985e09" strokeWidth="2" />
        </>
      )}
    </svg>
  )
}

export function StartSymbol() {
  return (
    <svg viewBox="0 0 28 28" width="26" height="26" aria-hidden="true">
      <path d="m2 4 10-2v10L2 13z" fill="#f35b42" />
      <path d="m14 2 11 2v9l-11-1z" fill="#81cf49" />
      <path d="m2 15 10-1v10L2 26z" fill="#56b5f0" />
      <path d="m14 14 11 1v11l-11-2z" fill="#ffdc54" />
    </svg>
  )
}

export function TrayIcon({ kind }: { kind: 'speaker' | 'muted' | 'network' }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      {kind === 'network' ? (
        <>
          <path d="M1 3h7v5H1zM8 8h7v5H8z" fill="#cfe3ff" stroke="#fff" />
          <path d="M4 8v3h4" stroke="#fff" fill="none" />
        </>
      ) : (
        <>
          <path d="M2 6h3l4-3v10l-4-3H2z" fill="#fff" />
          {kind === 'speaker' ? (
            <path d="M11 5c1.5 1.5 1.5 4.5 0 6M13 3c3 3 3 7 0 10" stroke="#fff" fill="none" />
          ) : (
            <path d="m11 5 4 6m0-6-4 6" stroke="#ff6b5b" strokeWidth="1.6" />
          )}
        </>
      )}
    </svg>
  )
}
