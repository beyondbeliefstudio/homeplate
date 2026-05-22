-- HomePlate — Supabase Schema
-- Run this in the Supabase SQL editor for your homeplate project.
-- RLS is intentionally disabled on all tables — this is a single-household
-- personal app using a household_id UUID for logical data separation.

-- ─── recipes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recipes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL,
  name          text NOT NULL,
  category      text NOT NULL DEFAULT 'other',
  servings      integer NOT NULL DEFAULT 2,
  prep_time     integer NOT NULL DEFAULT 0,   -- minutes
  cook_time     integer NOT NULL DEFAULT 0,   -- minutes
  notes         text,
  image_url     text,
  ingredients   jsonb NOT NULL DEFAULT '[]',  -- [{name, quantity, unit}]
  instructions  jsonb NOT NULL DEFAULT '[]',  -- [string]
  nutrition     jsonb NOT NULL DEFAULT '{}',  -- {calories, protein, carbs, fat, fiber}
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_recipes_household ON recipes (household_id);

-- ─── meal_plans ─────────────────────────────────────────────────────────────
-- One row per household per week (week_key = "2026-W21")
CREATE TABLE IF NOT EXISTS meal_plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL,
  week_key      text NOT NULL,
  plan          jsonb NOT NULL DEFAULT '{}',
  -- plan shape: { "0": {breakfast, lunch, dinner, snack}, ..., "6": {...} }
  -- values are recipe UUIDs or null
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, week_key)
);

ALTER TABLE meal_plans DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_meal_plans_household ON meal_plans (household_id);

-- ─── grocery_list ────────────────────────────────────────────────────────────
-- One active list per household, stored as jsonb array
CREATE TABLE IF NOT EXISTS grocery_list (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL UNIQUE,
  items         jsonb NOT NULL DEFAULT '[]',
  -- item shape: {id, name, quantity, unit, category, recipeIds[], manual, checked}
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE grocery_list DISABLE ROW LEVEL SECURITY;

-- ─── stores ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL,
  name          text NOT NULL,
  aisles        jsonb NOT NULL DEFAULT '[]',
  -- aisle shape: [{name, categories[]}]
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_stores_household ON stores (household_id);

-- ─── staples ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staples (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL,
  name          text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, name)
);

ALTER TABLE staples DISABLE ROW LEVEL SECURITY;
CREATE INDEX idx_staples_household ON staples (household_id);
