import type { ToolConfig } from '../types/toolConfig';

export const simpleCalculator: ToolConfig = {
  id: 'simple-calculator',
  type: 'calculator',
  title: 'Simple Calculator',
  description: 'Basic arithmetic calculator',
  sections: [
    {
      id: 'inputs',
      title: 'Input Numbers',
      inputs: [
        {
          id: 'num1',
          type: 'number',
          label: 'First Number',
          defaultValue: 0,
          required: true,
        },
        {
          id: 'operation',
          type: 'select',
          label: 'Operation',
          defaultValue: 'add',
          options: [
            { label: 'Add (+)', value: 'add' },
            { label: 'Subtract (-)', value: 'subtract' },
            { label: 'Multiply (×)', value: 'multiply' },
            { label: 'Divide (÷)', value: 'divide' },
          ],
          required: true,
        },
        {
          id: 'num2',
          type: 'number',
          label: 'Second Number',
          defaultValue: 0,
          required: true,
        },
      ],
      actions: [
        {
          id: 'calculate',
          label: 'Calculate',
          type: 'primary',
          logic: `
            const n1 = Number(inputs.num1);
            const n2 = Number(inputs.num2);
            const op = inputs.operation;

            let result;
            switch (op) {
              case 'add':
                result = n1 + n2;
                break;
              case 'subtract':
                result = n1 - n2;
                break;
              case 'multiply':
                result = n1 * n2;
                break;
              case 'divide':
                result = n2 !== 0 ? n1 / n2 : 'Error: Division by zero';
                break;
              default:
                result = 'Invalid operation';
            }

            results.result = result;
            results.expression = \`\${n1} \${op === 'add' ? '+' : op === 'subtract' ? '-' : op === 'multiply' ? '×' : '÷'} \${n2} = \${result}\`;
          `,
        },
      ],
      outputs: [
        {
          id: 'result',
          type: 'number',
          label: 'Result',
          copyable: true,
        },
        {
          id: 'expression',
          type: 'text',
          label: 'Expression',
        },
      ],
    },
  ],
};

export const percentageCalculator: ToolConfig = {
  id: 'percentage-calculator',
  type: 'calculator',
  title: 'Percentage Calculator',
  description: 'Calculate percentages and changes',
  sections: [
    {
      id: 'percentage',
      title: 'What is X% of Y?',
      inputs: [
        {
          id: 'percent',
          type: 'number',
          label: 'Percentage (%)',
          defaultValue: 0,
        },
        {
          id: 'total',
          type: 'number',
          label: 'Of Total',
          defaultValue: 0,
        },
      ],
      actions: [
        {
          id: 'calculate',
          label: 'Calculate',
          type: 'primary',
          logic: `
            const percent = Number(inputs.percent);
            const total = Number(inputs.total);
            const result = (percent / 100) * total;

            results.percentResult = round(result, 2);
            results.percentFormula = \`\${percent}% of \${total} = \${round(result, 2)}\`;
          `,
        },
      ],
      outputs: [
        {
          id: 'percentResult',
          type: 'number',
          label: 'Result',
          format: 'fixed:2',
          copyable: true,
        },
        {
          id: 'percentFormula',
          type: 'text',
          label: 'Calculation',
        },
      ],
    },
  ],
};
