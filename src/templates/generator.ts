import type { ToolConfig } from '../types/toolConfig';

export const passwordGenerator: ToolConfig = {
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
};
