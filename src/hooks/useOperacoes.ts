import { useCallback, useEffect, useRef, useState } from 'react';
import type { Operacao } from '../types';
import { loadOperacoes, removeOperacaoById, saveOperacoes } from '../services/localStorage';

interface PersistResult {
  success: boolean;
  error?: Error;
}

export function useOperacoes() {
  const [operacoes, setOperacoes] = useState<Operacao[]>(() => loadOperacoes());
  // Mantem callbacks estaveis sem capturar uma lista antiga de operacoes.
  const operacoesRef = useRef(operacoes);

  useEffect(() => {
    operacoesRef.current = operacoes;
  }, [operacoes]);

  useEffect(() => {
    function syncOperacoes() {
      const nextOperacoes = loadOperacoes();
      operacoesRef.current = nextOperacoes;
      setOperacoes(nextOperacoes);
    }

    window.addEventListener('storage', syncOperacoes);

    return () => {
      window.removeEventListener('storage', syncOperacoes);
    };
  }, []);

  const addOperacao = useCallback((operacao: Operacao): PersistResult => {
    const nextOperacoes = [operacao, ...operacoesRef.current];

    try {
      saveOperacoes(nextOperacoes);
      operacoesRef.current = nextOperacoes;
      setOperacoes(nextOperacoes);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error('Nao foi possivel salvar a operacao no navegador.'),
      };
    }
  }, []);

  const deleteOperacao = useCallback((id: string): PersistResult => {
    try {
      const nextOperacoes = removeOperacaoById(id);
      operacoesRef.current = nextOperacoes;
      setOperacoes(nextOperacoes);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error('Nao foi possivel atualizar o historico no navegador.'),
      };
    }
  }, []);

  const hydrateOperacaoImages = useCallback((imagesByCoinId: Record<string, string>): PersistResult => {
    let changed = false;

    const nextOperacoes = operacoesRef.current.map((operacao) => {
      if (operacao.coinImageUrl || !imagesByCoinId[operacao.coinId]) {
        return operacao;
      }

      changed = true;

      return {
        ...operacao,
        coinImageUrl: imagesByCoinId[operacao.coinId],
      };
    });

    if (!changed) {
      return { success: true };
    }

    try {
      saveOperacoes(nextOperacoes);
      operacoesRef.current = nextOperacoes;
      setOperacoes(nextOperacoes);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error('Nao foi possivel atualizar as imagens das operacoes no navegador.'),
      };
    }
  }, []);

  return {
    operacoes,
    addOperacao,
    deleteOperacao,
    hydrateOperacaoImages,
  };
}
