type Props = {
  className?: string
}

const logoStyle1 = {
  fill: '#00e5a4',
  strokeWidth: 0,
}

const logoStyle2 = {
  fill: '#000e38',
  strokeWidth: 0,
}

export const NFLogoSquare: React.FC<Props> = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 180 180'
    className={className}
  >
    <path
      style={logoStyle2}
      d='m60.18,60.18h11.3l36.71,53.4v-53.4h12.17v75.36h-11.3l-36.71-53.4v53.4h-12.17V60.18Z'
    />
    <path style={logoStyle1} d='m126.51,135.54h45.29v11.09h-45.29v-11.09Z' />
  </svg>
)
