import React, { useState, useEffect, useCallback } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

interface NumericInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value?: number;
  onChange?: (value: number) => void;
  currency?: string;
  currencyPosition?: 'prefix' | 'suffix';
  thousandSeparator?: string;
  decimalSeparator?: string;
  allowNegative?: boolean;
  allowDecimal?: boolean;
  maxLength?: number;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value = 0,
  onChange,
  currency,
  currencyPosition = 'suffix',
  thousandSeparator = '.',
  decimalSeparator = ',',
  allowNegative = false,
  allowDecimal = false,
  maxLength,
  ...textFieldProps
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  const formatNumber = useCallback((num: number): string => {
    if (num === 0 || isNaN(num)) return '';

    const parts = num.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

    let result = formattedInteger;
    if (decimalPart && allowDecimal) {
      result += decimalSeparator + decimalPart;
    }

    return result;
  }, [thousandSeparator, decimalSeparator, allowDecimal]);

  const parseNumber = useCallback((display: string): number => {
    if (!display || display === '') return 0;

    let cleanValue = display
      .replace(new RegExp(`\\${thousandSeparator}`, 'g'), '')
      .replace(new RegExp(`\\${decimalSeparator}`, 'g'), '.');

    const num = parseFloat(cleanValue);
    return isNaN(num) ? 0 : num;
  }, [thousandSeparator, decimalSeparator]);

  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value, formatNumber]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    const allowedChars = allowNegative ? '0-9-,' : '0-9,';
    const regex = new RegExp(`^[${allowedChars}${thousandSeparator}${decimalSeparator}]*$`);

    if (!regex.test(inputValue)) {
      return;
    }

    if (allowDecimal && (inputValue.match(new RegExp(`\\${decimalSeparator}`, 'g')) || []).length > 1) {
      return;
    }

    if (allowNegative && (inputValue.match(/-/g) || []).length > 1) {
      return;
    }

    if (maxLength && inputValue.length > maxLength) {
      return;
    }

    setDisplayValue(inputValue);

    const numericValue = parseNumber(inputValue);
    onChange?.(numericValue);
  };

  const handleBlur = () => {
    const numericValue = parseNumber(displayValue);
    setDisplayValue(formatNumber(numericValue));
    onChange?.(numericValue);
  };

  const handleFocus = () => {
    if (displayValue === formatNumber(0) && value === 0) {
      setDisplayValue('');
    }
  };

  const getSlotProps = () => {
    const baseInputProps = {
      inputMode: 'numeric' as const,
    };

    const adornments = currency ? {
      [currencyPosition === 'prefix' ? 'startAdornment' : 'endAdornment']: <InputAdornment position={currencyPosition === 'prefix' ? 'start' : 'end'}>{currency}</InputAdornment>,
    } : {};

    return {
      input: {
        ...textFieldProps.slotProps?.input,
        ...baseInputProps,
        ...adornments,
      },
    };
  };

  return (
    <TextField
      {...textFieldProps}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      slotProps={getSlotProps()}
    />
  );
};
