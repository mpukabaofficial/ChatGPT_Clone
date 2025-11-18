import type { ToolConfig } from '../types/toolConfig';

export const unitConverter: ToolConfig = {
  id: 'unit-converter',
  type: 'converter',
  title: 'Unit Converter',
  description: 'Convert between different units',
  sections: [
    {
      id: 'converter',
      inputs: [
        {
          id: 'value',
          type: 'number',
          label: 'Value',
          defaultValue: 1,
          required: true,
        },
        {
          id: 'fromUnit',
          type: 'select',
          label: 'From',
          defaultValue: 'meters',
          options: [
            { label: 'Meters', value: 'meters' },
            { label: 'Kilometers', value: 'kilometers' },
            { label: 'Miles', value: 'miles' },
            { label: 'Feet', value: 'feet' },
          ],
        },
        {
          id: 'toUnit',
          type: 'select',
          label: 'To',
          defaultValue: 'feet',
          options: [
            { label: 'Meters', value: 'meters' },
            { label: 'Kilometers', value: 'kilometers' },
            { label: 'Miles', value: 'miles' },
            { label: 'Feet', value: 'feet' },
          ],
        },
      ],
      actions: [
        {
          id: 'convert',
          label: 'Convert',
          type: 'primary',
          logic: `
            const conversionRates = {
              meters: 1,
              kilometers: 0.001,
              miles: 0.000621371,
              feet: 3.28084,
            };

            const value = Number(inputs.value);
            const from = inputs.fromUnit;
            const to = inputs.toUnit;

            const inMeters = value / conversionRates[from];
            const converted = inMeters * conversionRates[to];

            results.converted = round(converted, 4);
            results.formula = \`\${value} \${from} = \${round(converted, 4)} \${to}\`;
          `,
        },
      ],
      outputs: [
        {
          id: 'converted',
          type: 'number',
          label: 'Converted Value',
          copyable: true,
        },
        {
          id: 'formula',
          type: 'text',
          label: 'Conversion',
        },
      ],
    },
  ],
};
