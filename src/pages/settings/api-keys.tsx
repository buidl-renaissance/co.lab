import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Container, Main, Section, SectionTitle, Description } from '@/components/Layout';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import Footer from '@/components/Footer';

const PageContainer = styled(Container)`
  padding: 0rem;
`;

const ContentSection = styled(Section)`
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 2px 8px ${({ theme }) => theme.shadow};
`;

const CardTitle = styled.h3`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text};
`;

const KeyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const KeyItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.border};
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const KeyInfo = styled.div`
  flex: 1;
  min-width: 200px;
`;

const KeyLabel = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.25rem;
`;

const KeyPrefix = styled.code`
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  background: ${({ theme }) => theme.surface};
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
`;

const KeyMeta = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.5rem;
`;

const KeyScopes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const ScopeBadge = styled.span`
  background: ${({ theme }) => theme.accent};
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
`;

const KeyActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DangerButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #d32f2f;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.text};
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  font-size: 1rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`;

const RawKeyDisplay = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  word-break: break-all;
`;

const RawKeyCode = styled.code`
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
`;

const WarningText = styled.p`
  color: #f44336;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const SuccessText = styled.p`
  color: #4caf50;
  font-size: 0.9rem;
`;

const CopyButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #6d9dc5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 0.5rem;

  &:hover {
    background-color: #5a8db5;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textSecondary};
`;

interface ApiKey {
  id: string;
  keyPrefix: string;
  label: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface PublicKey {
  id: string;
  publicKey: string;
  label: string;
  createdAt: string;
}

const AVAILABLE_SCOPES = [
  { value: '*', label: 'Full Access' },
  { value: 'listCollaborations', label: 'List Collaborations' },
  { value: 'getCollaboration', label: 'Get Collaboration' },
  { value: 'createCollaboration', label: 'Create Collaboration' },
  { value: 'updateCollaboration', label: 'Update Collaboration' },
  { value: 'deleteCollaboration', label: 'Delete Collaboration' },
  { value: 'getUserByFid', label: 'Get User by FID' },
  { value: 'getUserByUsername', label: 'Get User by Username' },
  { value: 'listGithubRepos', label: 'List GitHub Repos' },
  { value: 'getGithubIssueLinks', label: 'Get GitHub Issue Links' },
];

export default function ApiKeysSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [publicKeys, setPublicKeys] = useState<PublicKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['*']);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const [apiKeysRes, publicKeysRes] = await Promise.all([
        fetch('/api/auth/api-keys', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch('/api/auth/public-keys', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      if (apiKeysRes.ok) {
        const data = await apiKeysRes.json();
        setApiKeys(data.data || []);
      }

      if (publicKeysRes.ok) {
        const data = await publicKeysRes.json();
        setPublicKeys(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch keys:', err);
      setError('Failed to load keys');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const token = localStorage.getItem('mcp_access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreateApiKey = async () => {
    if (!newKeyLabel.trim()) {
      setError('Please enter a label for the API key');
      return;
    }

    if (selectedScopes.length === 0) {
      setError('Please select at least one scope');
      return;
    }

    setError(null);

    try {
      const res = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          label: newKeyLabel,
          scopes: selectedScopes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCreatedKey(data.data.rawKey);
        setApiKeys([...apiKeys, {
          id: data.data.id,
          keyPrefix: data.data.keyPrefix,
          label: data.data.label,
          scopes: data.data.scopes,
          lastUsedAt: null,
          expiresAt: data.data.expiresAt,
          createdAt: data.data.createdAt,
        }]);
      } else {
        setError(data.error || 'Failed to create API key');
      }
    } catch (err) {
      console.error('Failed to create API key:', err);
      setError('Failed to create API key');
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        setApiKeys(apiKeys.filter((k) => k.id !== id));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to revoke API key');
      }
    } catch (err) {
      console.error('Failed to revoke API key:', err);
      setError('Failed to revoke API key');
    }
  };

  const handleRevokePublicKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this public key? You will no longer be able to authenticate with it.')) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/public-keys/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        setPublicKeys(publicKeys.filter((k) => k.id !== id));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to revoke public key');
      }
    } catch (err) {
      console.error('Failed to revoke public key:', err);
      setError('Failed to revoke public key');
    }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewKeyLabel('');
    setSelectedScopes(['*']);
    setCreatedKey(null);
    setError(null);
    setCopied(false);
  };

  const toggleScope = (scope: string) => {
    if (scope === '*') {
      setSelectedScopes(['*']);
    } else {
      const newScopes = selectedScopes.filter((s) => s !== '*');
      if (selectedScopes.includes(scope)) {
        setSelectedScopes(newScopes.filter((s) => s !== scope));
      } else {
        setSelectedScopes([...newScopes, scope]);
      }
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString();
  };

  if (!accessToken) {
    return (
      <PageContainer>
        <Main>
          <ContentSection>
            <SectionTitle size="small">API Key Management</SectionTitle>
            <Description>
              Manage your API keys for programmatic access to the MCP endpoint.
            </Description>
            <Card>
              <CardTitle>Authentication Required</CardTitle>
              <p>
                Please authenticate using PKI to manage your API keys.
                You can authenticate using the mobile app or CLI with your Ed25519 keypair.
              </p>
            </Card>
          </ContentSection>
        </Main>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Main>
        <ContentSection>
          <SectionTitle size="small">API Key Management</SectionTitle>
          <Description>
            Manage your API keys for programmatic access to the MCP endpoint.
          </Description>

          {error && (
            <Card style={{ borderLeft: '4px solid #f44336' }}>
              <p style={{ color: '#f44336' }}>{error}</p>
            </Card>
          )}

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <CardTitle style={{ margin: 0 }}>API Keys</CardTitle>
              <PrimaryButton onClick={() => setShowCreateModal(true)}>
                Generate New Key
              </PrimaryButton>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : apiKeys.length === 0 ? (
              <EmptyState>
                <p>No API keys yet. Create one to get started.</p>
              </EmptyState>
            ) : (
              <KeyList>
                {apiKeys.map((key) => (
                  <KeyItem key={key.id}>
                    <KeyInfo>
                      <KeyLabel>{key.label}</KeyLabel>
                      <KeyPrefix>{key.keyPrefix}...</KeyPrefix>
                      <KeyScopes>
                        {key.scopes.map((scope) => (
                          <ScopeBadge key={scope}>{scope}</ScopeBadge>
                        ))}
                      </KeyScopes>
                      <KeyMeta>
                        Created: {formatDate(key.createdAt)} | 
                        Last used: {formatDate(key.lastUsedAt)}
                        {key.expiresAt && ` | Expires: ${formatDate(key.expiresAt)}`}
                      </KeyMeta>
                    </KeyInfo>
                    <KeyActions>
                      <DangerButton onClick={() => handleRevokeApiKey(key.id)}>
                        Revoke
                      </DangerButton>
                    </KeyActions>
                  </KeyItem>
                ))}
              </KeyList>
            )}
          </Card>

          <Card>
            <CardTitle>Registered Public Keys</CardTitle>
            {loading ? (
              <p>Loading...</p>
            ) : publicKeys.length === 0 ? (
              <EmptyState>
                <p>No public keys registered. Register one using the API or mobile app.</p>
              </EmptyState>
            ) : (
              <KeyList>
                {publicKeys.map((key) => (
                  <KeyItem key={key.id}>
                    <KeyInfo>
                      <KeyLabel>{key.label}</KeyLabel>
                      <KeyPrefix>{key.publicKey.substring(0, 16)}...</KeyPrefix>
                      <KeyMeta>Created: {formatDate(key.createdAt)}</KeyMeta>
                    </KeyInfo>
                    <KeyActions>
                      <DangerButton onClick={() => handleRevokePublicKey(key.id)}>
                        Revoke
                      </DangerButton>
                    </KeyActions>
                  </KeyItem>
                ))}
              </KeyList>
            )}
          </Card>
        </ContentSection>
      </Main>
      <Footer />

      {showCreateModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <ModalContent>
            {createdKey ? (
              <>
                <ModalTitle>API Key Created</ModalTitle>
                <WarningText>
                  Copy this key now. You won&apos;t be able to see it again!
                </WarningText>
                <RawKeyDisplay>
                  <RawKeyCode>{createdKey}</RawKeyCode>
                </RawKeyDisplay>
                <CopyButton onClick={handleCopyKey}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </CopyButton>
                {copied && <SuccessText>Key copied to clipboard</SuccessText>}
                <ButtonContainer>
                  <SecondaryButton onClick={handleCloseModal}>
                    Done
                  </SecondaryButton>
                </ButtonContainer>
              </>
            ) : (
              <>
                <ModalTitle>Generate New API Key</ModalTitle>
                <FormGroup>
                  <Label>Label</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Production App, Dev CLI"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Scopes</Label>
                  <CheckboxGroup>
                    {AVAILABLE_SCOPES.map((scope) => (
                      <CheckboxLabel key={scope.value}>
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope.value)}
                          onChange={() => toggleScope(scope.value)}
                        />
                        {scope.label}
                      </CheckboxLabel>
                    ))}
                  </CheckboxGroup>
                </FormGroup>
                {error && <WarningText>{error}</WarningText>}
                <ButtonContainer>
                  <PrimaryButton onClick={handleCreateApiKey}>
                    Create Key
                  </PrimaryButton>
                  <SecondaryButton onClick={handleCloseModal}>
                    Cancel
                  </SecondaryButton>
                </ButtonContainer>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
}
