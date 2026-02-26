import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';

import MultiLabelSelector from '@/components/common/MultiLabelSelector';
import { Option } from '@/components/ui/multiple-selector';

interface ResearchInterestsProps {
  editMode: boolean;
}

const ResearchInterests: React.FC<ResearchInterestsProps> = ({ editMode }) => {
  const { control } = useFormContext();

  return (
    <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-common-contrast bg-common-cardBackground p-4 md:p-6">
      <h2 className="mb-2 font-bold text-text-primary res-text-xl">Research Interests</h2>
      <p className="mb-6 text-sm text-text-tertiary">
        Select or add keywords that represent your research interests.
      </p>
      <Controller
        name="researchInterests"
        control={control}
        rules={{
          validate: (value: Option[]) => {
            if (!value || value.length === 0) return true;
            const regex = /^[A-Za-z\s]+$/;
            const hasInvalid = value.some((item) => !regex.test(item.label));
            return hasInvalid ? 'Interests should only contain letters' : true;
          },
        }}
        render={({ field, fieldState }) => (
          <div className="w-full">
            <MultiLabelSelector
              disabled={!editMode}
              label="Research Interests"
              tooltipText="Select or add keywords for your research interests."
              placeholder="Add Research Interests"
              creatable
              {...field}
              fieldState={fieldState}
            />
          </div>
        )}
      />
    </div>
  );
};

export default ResearchInterests;