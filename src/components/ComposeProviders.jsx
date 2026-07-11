import React from 'react';

export const ComposeProviders = ({ providers, children }) => {
  return providers.reduceRight((acc, ProviderInfo) => {
    if (Array.isArray(ProviderInfo)) {
      const [ProviderComponent, props] = ProviderInfo;
      return <ProviderComponent {...props}>{acc}</ProviderComponent>;
    }
    const ProviderComponent = ProviderInfo;
    return <ProviderComponent>{acc}</ProviderComponent>;
  }, children);
};
