export type MacIconKind =
  | 'folder'
  | 'disk'
  | 'trash'
  | 'trash-full'
  | 'document'
  | 'app'
  | 'computer'

/** One-bit drawings, black on white, in the spirit of the 1984 desktop. All original. */
export function MacIcon({ kind, size = 40 }: { kind: MacIconKind; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="#fff"
      stroke="#111"
      strokeWidth="1.5"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {kind === 'folder' ? (
        <>
          <path d="M2 7h11l2 3h15v17H2z" />
          <path d="M2 12h28" />
        </>
      ) : kind === 'disk' ? (
        <>
          <path d="M3 9h26v14H3z" />
          <path d="M6 19h4M22 19h3" />
          <path d="M3 23h26" strokeWidth="3" />
        </>
      ) : kind === 'trash' || kind === 'trash-full' ? (
        <>
          <path d="M7 9h18l-2 20H9z" />
          <path d="M5 7h22v3H5zM13 4h6v3h-6z" />
          <path d="M12 13v13M16 13v13M20 13v13" />
          {kind === 'trash-full' ? <path d="M9 7c2-4 5-2 7-4 3 2 5 0 7 4" fill="#111" /> : null}
        </>
      ) : kind === 'document' ? (
        <>
          <path d="M7 3h13l6 6v20H7z" />
          <path d="M20 3v6h6M10 14h12M10 18h12M10 22h8" />
        </>
      ) : kind === 'app' ? (
        <>
          <path d="M16 3 29 16 16 29 3 16z" />
          <path d="M16 9 23 16 16 23 9 16z" fill="#111" />
        </>
      ) : (
        <SmilingComputerShape />
      )}
    </svg>
  )
}

function SmilingComputerShape() {
  return (
    <>
      <path d="M6 2h20v26H6z" />
      <path d="M9 5h14v12H9z" fill="#fff" />
      <path d="M13 8v3M19 8v3" />
      <path d="M13 14c2 2 4 2 6 0" fill="none" />
      <path d="M10 22h6M8 28v2h16v-2" />
    </>
  )
}

/** The startup face: a little computer that smiles back. */
export function SmilingComputer() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="64"
      height="64"
      fill="#fff"
      stroke="#111"
      strokeWidth="1.5"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <SmilingComputerShape />
    </svg>
  )
}

/** The system menu mark: a diamond, not a fruit. */
export function SystemMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M8 1 15 8 8 15 1 8z" fill="#111" />
      <path d="M8 5 11 8 8 11 5 8z" fill="#fff" />
    </svg>
  )
}
