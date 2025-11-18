import type { ToolInput as ToolInputType } from '../../types/toolConfig';
import { DateColorInput } from './inputs/DateColorInput';
import { SelectTextareaInput } from './inputs/SelectTextareaInput';
import { SliderCheckboxInput } from './inputs/SliderCheckboxInput';
import { TextNumberInput } from './inputs/TextNumberInput';

interface Props {
  input: ToolInputType;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}

const ToolInput = ({ input, value, onChange }: Props) => {
  // Route to appropriate input component based on type
  if (input.type === 'text' || input.type === 'number') {
    return <TextNumberInput input={input} value={value as string | number} onChange={onChange} />;
  }

  if (input.type === 'select' || input.type === 'textarea') {
    return <SelectTextareaInput input={input} value={value as string} onChange={onChange as (value: string) => void} />;
  }

  if (input.type === 'slider' || input.type === 'checkbox') {
    return <SliderCheckboxInput input={input} value={value as number | boolean} onChange={onChange as (value: number | boolean) => void} />;
  }

  if (input.type === 'date' || input.type === 'color') {
    return <DateColorInput input={input} value={value as string} onChange={onChange as (value: string) => void} />;
  }

  return null;
};

export default ToolInput;
