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

const ApiKeyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ApiKeyItem = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ApiKeyInfo = styled.div`
  flex: 1;
  min-width: 200px;
`;

const ApiKeyName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
`;

const ApiKeyMeta = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const ScopesBadge = styled.span`
  background: ${({ theme }) => theme.backgroundAlt || '#f5f5f5'};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
`;

const RevokeButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  color: #f44336;
  border: 1px solid #f44336;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(244, 67, 54, 0.1);
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  font-size: 1rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};

  &:focus {
    outline: none;
    border-color: #ff7a59;
    box-shadow: 0 0 0 3px rgba(255, 122, 89, 0.1);
  }
`;

const KeyDisplay = styled.div`
  background: ${({ theme }) => theme.backgroundAlt || '#f5f5f5'};
  padding: 1rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
  margin-top: 0.5rem;
  border: 1px dashed ${({ theme }) => theme.border};
`;

const WarningText = styled.p`
  color: #f57c00;
  font-size: 0.875rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(245, 124, 0, 0.1);
  border-radius: 6px;
  border-left: 3px solid #f57c00;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ErrorMessage = styled.div`
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const AuthRequiredCard = styled(Card)`
  text-align: center;
`;

interface ApiKey {
  id: string;
  name: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
}

const ApiKeysPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/api-keys', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data.apiKeys);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const storedToken = localStorage.getItem('colab_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchApiKeys();
    }
  }, [accessToken, fetchApiKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newKeyName.trim() || !accessToken) return;

    setCreating(true);
    try {
      const response = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
          scopes: ['*'],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create API key');
      }

      const data = await response.json();
      setNewKeyValue(data.key);
      setShowCreateModal(false);
      setShowKeyModal(true);
      setNewKeyName('');
      fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!accessToken) return;

    setRevoking(keyId);
    try {
      const response = await fetch(`/api/auth/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to revoke API key');
      }

      fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key');
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  if (!accessToken) {
    return (
      <PageContainer>
        <Main>
          <ContentSection>
            <SectionTitle size="small">API Keys</SectionTitle>
            <Description>
              Manage your API keys for programmatic access to Co.Lab MCP tools.
            </Description>
            <AuthRequiredCard>
              <h3>Authentication Required</h3>
              <p style={{ marginTop: '1rem', color: 'inherit' }}>
                Please authenticate with your Ed25519 keypair to manage API keys.
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'inherit' }}>
                Store your access token in localStorage as `colab_access_token` after authenticating.
              </p>
            </AuthRequiredCard>
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
          <SectionTitle size="small">API Keys</SectionTitle>
          <Description>
            Manage your API keys for programmatic access to Co.Lab MCP tools.
          </Description>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Your API Keys</h3>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', opacity: 0.7 }}>
                  Use API keys to authenticate MCP tool calls
                </p>
              </div>
              <PrimaryButton onClick={() => setShowCreateModal(true)}>
                Generate New Key
              </PrimaryButton>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : apiKeys.length === 0 ? (
              <EmptyState>
                <p>No API keys yet</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Create your first API key to start using the MCP tools programmatically
                </p>
              </EmptyState>
            ) : (
              <ApiKeyList>
                {apiKeys.map((key) => (
                  <ApiKeyItem key={key.id}>
                    <ApiKeyInfo>
                      <ApiKeyName>{key.name}</ApiKeyName>
                      <ApiKeyMeta>
                        <span>Created: {formatDate(key.createdAt)}</span>
                        {key.lastUsedAt && (
                          <span>Last used: {formatDate(key.lastUsedAt)}</span>
                        )}
                        <ScopesBadge>
                          {key.scopes.includes('*') ? 'Full access' : key.scopes.join(', ')}
                        </ScopesBadge>
                      </ApiKeyMeta>
                    </ApiKeyInfo>
                    <RevokeButton
                      onClick={() => handleRevokeKey(key.id)}
                      disabled={revoking === key.id}
                    >
                      {revoking === key.id ? 'Revoking...' : 'Revoke'}
                    </RevokeButton>
                  </ApiKeyItem>
                ))}
              </ApiKeyList>
            )}
          </Card>
        </ContentSection>
      </Main>
      <Footer />

      {showCreateModal && (
        <Modal onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Generate New API Key</ModalTitle>
            <Form onSubmit={handleCreateKey}>
              <FormGroup>
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production MCP Client"
                  required
                  maxLength={100}
                />
              </FormGroup>
              <ButtonRow>
                <SecondaryButton type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={creating || !newKeyName.trim()}>
                  {creating ? 'Creating...' : 'Create Key'}
                </PrimaryButton>
              </ButtonRow>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {showKeyModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Your New API Key</ModalTitle>
            <p style={{ color: 'inherit' }}>
              Copy this key now. You won&apos;t be able to see it again.
            </p>
            <KeyDisplay>{newKeyValue}</KeyDisplay>
            <WarningText>
              Store this key securely. It provides access to your MCP tools and cannot be recovered once you close this dialog.
            </WarningText>
            <ButtonRow>
              <SecondaryButton onClick={() => copyToClipboard(newKeyValue)}>
                Copy to Clipboard
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  setShowKeyModal(false);
                  setNewKeyValue('');
                }}
              >
                Done
              </PrimaryButton>
            </ButtonRow>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default ApiKeysPage;
