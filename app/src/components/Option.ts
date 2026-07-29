const Option = {
  Info: 'info',
  Projects: 'projects',
  Resume: 'resume',
} as const;

type Option = (typeof Option)[keyof typeof Option];

export { Option };
export default Option;
