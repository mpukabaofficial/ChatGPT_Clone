import type { ToolConfig } from '../types/toolConfig';

export const TOOL_TEMPLATES: Record<string, ToolConfig> = {
  simpleCalculator: {
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
  },

  unitConverter: {
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

              // Convert to meters first, then to target unit
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
  },

  percentageCalculator: {
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
      {
        id: 'change',
        title: 'Percentage Change',
        inputs: [
          {
            id: 'oldValue',
            type: 'number',
            label: 'Old Value',
            defaultValue: 0,
          },
          {
            id: 'newValue',
            type: 'number',
            label: 'New Value',
            defaultValue: 0,
          },
        ],
        actions: [
          {
            id: 'calculateChange',
            label: 'Calculate Change',
            type: 'primary',
            logic: `
              const oldVal = Number(inputs.oldValue);
              const newVal = Number(inputs.newValue);

              if (oldVal === 0) {
                results.changeResult = 'Cannot calculate (old value is 0)';
                return;
              }

              const change = ((newVal - oldVal) / oldVal) * 100;
              const direction = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no change';

              results.changeResult = \`\${round(Math.abs(change), 2)}%\`;
              results.changeDirection = direction;
              results.changeFormula = \`From \${oldVal} to \${newVal} is a \${round(Math.abs(change), 2)}% \${direction}\`;
            `,
          },
        ],
        outputs: [
          {
            id: 'changeResult',
            type: 'number',
            label: 'Percentage Change',
            copyable: true,
          },
          {
            id: 'changeFormula',
            type: 'text',
            label: 'Explanation',
          },
        ],
      },
    ],
  },

  bmiCalculator: {
    id: 'bmi-calculator',
    type: 'calculator',
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index',
    sections: [
      {
        id: 'bmi',
        inputs: [
          {
            id: 'weight',
            type: 'number',
            label: 'Weight (kg)',
            defaultValue: 70,
            min: 0,
            step: 0.1,
          },
          {
            id: 'height',
            type: 'number',
            label: 'Height (cm)',
            defaultValue: 170,
            min: 0,
            step: 0.1,
          },
        ],
        actions: [
          {
            id: 'calculate',
            label: 'Calculate BMI',
            type: 'primary',
            logic: `
              const weight = Number(inputs.weight);
              const height = Number(inputs.height) / 100; // Convert to meters

              if (weight <= 0 || height <= 0) {
                results.bmi = 'Invalid input';
                results.category = '';
                results.advice = '';
                return;
              }

              const bmi = weight / (height * height);
              let category, advice;

              if (bmi < 18.5) {
                category = 'Underweight';
                advice = 'Consider consulting with a healthcare provider about healthy weight gain.';
              } else if (bmi < 25) {
                category = 'Normal weight';
                advice = 'Great! Maintain your healthy lifestyle.';
              } else if (bmi < 30) {
                category = 'Overweight';
                advice = 'Consider adopting a balanced diet and regular exercise routine.';
              } else {
                category = 'Obese';
                advice = 'Consult with a healthcare provider for personalized advice.';
              }

              results.bmi = round(bmi, 1);
              results.category = category;
              results.advice = advice;
            `,
          },
        ],
        outputs: [
          {
            id: 'bmi',
            type: 'number',
            label: 'Your BMI',
            format: 'fixed:1',
            copyable: true,
          },
          {
            id: 'category',
            type: 'card',
            label: 'Category',
          },
          {
            id: 'advice',
            type: 'card',
            label: 'Recommendation',
          },
        ],
      },
    ],
  },

  passwordGenerator: {
    id: 'password-generator',
    type: 'generator',
    title: 'Password Generator',
    description: 'Generate secure random passwords',
    sections: [
      {
        id: 'options',
        inputs: [
          {
            id: 'length',
            type: 'slider',
            label: 'Password Length',
            defaultValue: 16,
            min: 8,
            max: 64,
            step: 1,
          },
          {
            id: 'includeUpper',
            type: 'checkbox',
            label: 'Include Uppercase',
            defaultValue: true,
            helpText: 'Include uppercase letters (A-Z)',
          },
          {
            id: 'includeLower',
            type: 'checkbox',
            label: 'Include Lowercase',
            defaultValue: true,
            helpText: 'Include lowercase letters (a-z)',
          },
          {
            id: 'includeNumbers',
            type: 'checkbox',
            label: 'Include Numbers',
            defaultValue: true,
            helpText: 'Include numbers (0-9)',
          },
          {
            id: 'includeSymbols',
            type: 'checkbox',
            label: 'Include Symbols',
            defaultValue: true,
            helpText: 'Include symbols (!@#$%^&*)',
          },
        ],
        actions: [
          {
            id: 'generate',
            label: 'Generate Password',
            type: 'primary',
            logic: `
              const length = Number(inputs.length);
              const includeUpper = inputs.includeUpper;
              const includeLower = inputs.includeLower;
              const includeNumbers = inputs.includeNumbers;
              const includeSymbols = inputs.includeSymbols;

              let charset = '';
              if (includeUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
              if (includeLower) charset += 'abcdefghijklmnopqrstuvwxyz';
              if (includeNumbers) charset += '0123456789';
              if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

              if (charset === '') {
                results.password = 'Please select at least one character type';
                results.strength = '';
                return;
              }

              let password = '';
              for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                password += charset[randomIndex];
              }

              // Calculate password strength
              let strength = 'Weak';
              if (length >= 12 && charset.length > 50) strength = 'Strong';
              else if (length >= 8 && charset.length > 30) strength = 'Medium';

              results.password = password;
              results.strength = \`Strength: \${strength}\`;
              results.charsetSize = \`Character pool: \${charset.length} characters\`;
            `,
          },
        ],
        outputs: [
          {
            id: 'password',
            type: 'code',
            label: 'Generated Password',
            copyable: true,
          },
          {
            id: 'strength',
            type: 'text',
            label: 'Password Strength',
          },
          {
            id: 'charsetSize',
            type: 'text',
            label: 'Complexity',
          },
        ],
      },
    ],
  },
};

// Helper function to get template examples for the LLM
export function getTemplateExamples(): string {
  return Object.keys(TOOL_TEMPLATES).map((key) => {
    const template = TOOL_TEMPLATES[key];
    return `Template "${key}": ${template.title} - ${template.description}`;
  }).join('\n');
}

// Get a template by ID
export function getTemplate(templateId: string): ToolConfig | null {
  return TOOL_TEMPLATES[templateId] || null;
}
