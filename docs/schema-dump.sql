--
-- PostgreSQL database dump
--

\restrict Safa4k6utnX8yRvqdkdFOcXgh085sWiGT8AcRdsBDOsZ1R6gdOAwGYNMjhsgUut

-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: ashishkumarhit23
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO ashishkumarhit23;

--
-- Name: cameras; Type: TABLE; Schema: public; Owner: ashishkumarhit23
--

CREATE TABLE public.cameras (
    id uuid NOT NULL,
    store_id uuid NOT NULL,
    zone_id uuid,
    camera_name character varying NOT NULL,
    stream_url character varying NOT NULL,
    status character varying NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.cameras OWNER TO ashishkumarhit23;

--
-- Name: products; Type: TABLE; Schema: public; Owner: ashishkumarhit23
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    store_id uuid NOT NULL,
    shelf_id uuid,
    name character varying NOT NULL,
    sku character varying NOT NULL,
    category character varying NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO ashishkumarhit23;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: ashishkumarhit23
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.roles OWNER TO ashishkumarhit23;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: ashishkumarhit23
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO ashishkumarhit23;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ashishkumarhit23
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: shelves; Type: TABLE; Schema: public; Owner: ashishkumarhit23
--

CREATE TABLE public.shelves (
    id uuid NOT NULL,
    store_id uuid NOT NULL,
    shelf_name character varying NOT NULL,
    zone_coordinates jsonb NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.shelves OWNER TO ashishkumarhit23;

--
-- Name: stores; Type: TABLE; Schema: public; Owner: ashishkumarhit23
--

CREATE TABLE public.stores (
    id uuid NOT NULL,
    name character varying NOT NULL,
    location character varying NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.stores OWNER TO ashishkumarhit23;

--
-- Name: users; Type: TABLE; Schema: public; Owner: ashishkumarhit23
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying NOT NULL,
    hashed_password character varying NOT NULL,
    role_id integer NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO ashishkumarhit23;

--
-- Name: zones; Type: TABLE; Schema: public; Owner: ashishkumarhit23
--

CREATE TABLE public.zones (
    id uuid NOT NULL,
    store_id uuid NOT NULL,
    zone_name character varying NOT NULL,
    coordinates jsonb NOT NULL,
    zone_type character varying NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.zones OWNER TO ashishkumarhit23;

--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: cameras cameras_pkey; Type: CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: shelves shelves_pkey; Type: CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.shelves
    ADD CONSTRAINT shelves_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- Name: ix_products_sku; Type: INDEX; Schema: public; Owner: ashishkumarhit23
--

CREATE INDEX ix_products_sku ON public.products USING btree (sku);


--
-- Name: ix_roles_name; Type: INDEX; Schema: public; Owner: ashishkumarhit23
--

CREATE UNIQUE INDEX ix_roles_name ON public.roles USING btree (name);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: ashishkumarhit23
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: cameras cameras_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: cameras cameras_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id) ON DELETE SET NULL;


--
-- Name: products products_shelf_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_shelf_id_fkey FOREIGN KEY (shelf_id) REFERENCES public.shelves(id) ON DELETE SET NULL;


--
-- Name: products products_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: shelves shelves_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.shelves
    ADD CONSTRAINT shelves_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: zones zones_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ashishkumarhit23
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Safa4k6utnX8yRvqdkdFOcXgh085sWiGT8AcRdsBDOsZ1R6gdOAwGYNMjhsgUut

