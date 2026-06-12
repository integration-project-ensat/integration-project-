/**
 * TESTS UNITAIRES — Profil Completion (Portfolio)
 *
 * But : vérifier la fonction isPortfolioComplete utilisée côté backend
 * pour calculer le pourcentage de complétion du portfolio.
 *
 * Scénarios :
 *   1. étudiant sans portfolio → 0%
 *   2. étudiant avec portfolio complet (titre + url_public) → 100%
 *   3. étudiant avec portfolio incomplet (que le titre) → 0%
 *   4. étudiant avec portfolio vide (auto-créé) → 0%
 */

import { describe, it, expect } from 'vitest'

/**
 * Reproduit exactement la logique de
 * backend/src/controllers/student.controller.js — isPortfolioComplete
 */
function isPortfolioComplete(portfolio) {
  if (!portfolio) return false

  if (!portfolio.titre || portfolio.titre.trim() === '') return false

  if (!portfolio.url_public || portfolio.url_public.trim() === '') return false

  if (portfolio.deleted_at !== null && portfolio.deleted_at !== undefined) return false

  return true
}

describe('Portfolio Completion — isPortfolioComplete()', () => {

  // ────────────────────────────────────────────────────────────────────────
  // PCO-U-01 : étudiant sans portfolio
  // ────────────────────────────────────────────────────────────────────────
  it('PCO-U-01 : null portfolio → false (0%)', () => {
    expect(isPortfolioComplete(null)).toBe(false)
  })

  it('PCO-U-01b : undefined portfolio → false (0%)', () => {
    expect(isPortfolioComplete(undefined)).toBe(false)
  })

  // ────────────────────────────────────────────────────────────────────────
  // PCO-U-02 : étudiant avec portfolio complet
  // ────────────────────────────────────────────────────────────────────────
  it('PCO-U-02 : portfolio complet (titre + url_public) → true (100%)', () => {
    const portfolio = {
      titre: 'Mon portfolio',
      url_public: 'abc-123-def',
      objectif_pro: 'DEV_WEB',
      theme: 'modern',
      est_public: true,
    }
    expect(isPortfolioComplete(portfolio)).toBe(true)
  })

  // ────────────────────────────────────────────────────────────────────────
  // PCO-U-03 : étudiant avec portfolio incomplet (titre seul)
  // ────────────────────────────────────────────────────────────────────────
  it('PCO-U-03 : portfolio sans url_public → false (0%)', () => {
    const portfolio = {
      titre: 'Mon portfolio',
      url_public: null,
    }
    expect(isPortfolioComplete(portfolio)).toBe(false)
  })

  it('PCO-U-03b : portfolio avec url_public vide → false (0%)', () => {
    const portfolio = {
      titre: 'Mon portfolio',
      url_public: '',
    }
    expect(isPortfolioComplete(portfolio)).toBe(false)
  })

  // ────────────────────────────────────────────────────────────────────────
  // PCO-U-04 : étudiant avec portfolio vide (auto-créé)
  // ────────────────────────────────────────────────────────────────────────
  it('PCO-U-04 : portfolio auto-créé (tout null) → false (0%)', () => {
    const portfolio = {
      titre: null,
      url_public: null,
      objectif_pro: null,
      theme: null,
      est_public: false,
    }
    expect(isPortfolioComplete(portfolio)).toBe(false)
  })

  it('PCO-U-04b : portfolio avec titre vide → false (0%)', () => {
    const portfolio = {
      titre: '',
      url_public: 'abc-123',
    }
    expect(isPortfolioComplete(portfolio)).toBe(false)
  })

  // ────────────────────────────────────────────────────────────────────────
  // PCO-U-05 : portfolio soft-deleté
  // ────────────────────────────────────────────────────────────────────────
  it('PCO-U-05 : portfolio soft-deleté (deleted_at défini) → false (0%)', () => {
    const portfolio = {
      titre: 'Mon portfolio',
      url_public: 'abc-123',
      deleted_at: new Date().toISOString(),
    }
    expect(isPortfolioComplete(portfolio)).toBe(false)
  })

})
