import type { ToolConfig } from '../types/toolConfig';

export const bmiCalculator: ToolConfig = {
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
            const height = Number(inputs.height) / 100;

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
};
