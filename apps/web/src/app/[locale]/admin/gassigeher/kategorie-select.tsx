const KATEGORIE_OPTION_STYLE: Record<string, React.CSSProperties> = {
  gruen: { backgroundColor: '#008512', color: '#ffffff' },
  gelb: { backgroundColor: '#ffea00', color: '#1c1500' },
  rot: { backgroundColor: '#e80c0c', color: '#ffffff' },
}

export default function KategorieSelect({
  defaultValue,
  labels,
  className,
}: {
  defaultValue: string
  labels: { empty: string; gruen: string; gelb: string; rot: string }
  className: string
}) {
  return (
    <select name="kategorie" defaultValue={defaultValue} className={className}>
      <option value="">{labels.empty}</option>
      <option value="gruen" style={KATEGORIE_OPTION_STYLE.gruen}>
        {labels.gruen}
      </option>
      <option value="gelb" style={KATEGORIE_OPTION_STYLE.gelb}>
        {labels.gelb}
      </option>
      <option value="rot" style={KATEGORIE_OPTION_STYLE.rot}>
        {labels.rot}
      </option>
    </select>
  )
}
