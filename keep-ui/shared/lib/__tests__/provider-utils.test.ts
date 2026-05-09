import { isProviderInstalled } from '../provider-utils';

type ProviderLike = {
  type: string;
  config: Record<string, unknown>;
};

describe('provider-utils', () => {
  describe('isProviderInstalled', () => {
    it('should return true if the provider is installed', () => {
      const provider = {
        type: 'slack',
        installed: true
      };
      const providers: ProviderLike[] = [];
      
      expect(isProviderInstalled(provider, providers)).toBe(true);
    });

    it('should return true if the provider is not installed and no providers of the same type exist', () => {
      const provider = {
        type: 'slack',
        installed: false
      };
      const providers: ProviderLike[] = [];
      
      expect(isProviderInstalled(provider, providers)).toBe(true);
    });

    it('should return false if the provider is not installed and another provider of the same type is configured', () => {
      const provider = {
        type: 'slack',
        installed: false
      };
      const providers: ProviderLike[] = [
        {
          type: 'slack',
          config: { apiKey: 'some-key' }
        }
      ];
      
      expect(isProviderInstalled(provider, providers)).toBe(false);
    });

    it('should return true if a provider of the same type exists but has no config', () => {
      const provider = {
        type: 'slack',
        installed: false
      };
      const providers: ProviderLike[] = [
        {
          type: 'slack',
          config: {}
        }
      ];
      
      expect(isProviderInstalled(provider, providers)).toBe(true);
    });

    it('should return true if a provider of the same type exists but config is empty', () => {
      const provider = {
        type: 'slack',
        installed: false
      };
      const providers: ProviderLike[] = [
        {
          type: 'slack',
          config: {}
        }
      ];
      
      expect(isProviderInstalled(provider, providers)).toBe(true);
    });

    it('should handle multiple providers with different types correctly', () => {
      const provider = {
        type: 'slack',
        installed: false
      };
      const providers: ProviderLike[] = [
        {
          type: 'discord',
          config: { token: 'some-token' }
        }
      ];
      
      expect(isProviderInstalled(provider, providers)).toBe(true);
    });

    it('should return false if multiple providers exist with one matching the type with non-empty config', () => {
      const provider = {
        type: 'slack',
        installed: false
      };
      const providers: ProviderLike[] = [
        {
          type: 'discord',
          config: { token: 'some-token' }
        },
        {
          type: 'slack',
          config: { apiKey: 'some-key' }
        }
      ];
      
      expect(isProviderInstalled(provider, providers)).toBe(false);
    });

    it('should handle case when providers is undefined', () => {
      const provider = {
        type: 'slack',
        installed: false
      };
      
      // @ts-ignore - Intentionally passing undefined to test handling
      expect(isProviderInstalled(provider, undefined)).toBe(true);
    });

    it('should handle case when providers is null', () => {
      const provider = {
        type: 'slack',
        installed: false
      };
      
      // @ts-ignore - Intentionally passing null to test handling
      expect(isProviderInstalled(provider, null)).toBe(true);
    });

    it('should handle case when provider has no type', () => {
      const provider = {
        // @ts-ignore - Intentionally passing invalid shape to test handling
        installed: true
      };
      const providers: ProviderLike[] = [];
      
      expect(isProviderInstalled(provider, providers)).toBe(true);
    });
  });
});
