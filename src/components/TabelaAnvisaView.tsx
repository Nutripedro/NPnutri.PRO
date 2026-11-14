import React from 'react';
import { AnvisaProductLabel } from '../types';
import { NutritionLabelHub } from './nutrition-label/NutritionLabelHub';

interface TabelaAnvisaViewProps {
  labelData: AnvisaProductLabel;
  onUpdateLabel: (label: AnvisaProductLabel) => void;
}

export const TabelaAnvisaView: React.FC<TabelaAnvisaViewProps> = ({
  labelData,
  onUpdateLabel
}) => {
  return (
    <NutritionLabelHub
      legacyLabelData={labelData}
      onSyncLegacyLabel={onUpdateLabel}
    />
  );
};
