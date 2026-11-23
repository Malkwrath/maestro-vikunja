<template>
	<div class="maestro-cockpit">
		<!-- SEKCJA 1: PIEDESTAŁ (AKTYWNE DUO, WIP <= 2) -->
		<section class="pedestal-section">
			<header class="section-header">
				<div class="title-group">
					<span class="owl-badge">WIP {{ activeDuo.length }} / 2</span>
					<h1>Piedestał — Aktywne Duo</h1>
				</div>
				<p class="section-subtitle">
					Maksymalnie dwa zadania w aktywnym ognisku. Aby wrzucić nowe, domknij
					lub cofnij jedno z poniższych.
				</p>
			</header>

			<div class="pedestal-grid">
				<div
					v-for="slotIndex in [0, 1]"
					:key="slotIndex"
					class="pedestal-slot"
					:class="{ 'is-occupied': Boolean(activeDuo[slotIndex]) }"
				>
					<template v-if="activeDuo[slotIndex]">
						<div class="slot-meta">
							<span class="slot-number">SLOT 0{{ slotIndex + 1 }}</span>
							<span class="slot-project">
								{{ getProjectBreadcrumb(activeDuo[slotIndex].project_id) }}
							</span>
						</div>

						<h2 class="slot-title">
							{{ activeDuo[slotIndex].title }}
						</h2>

						<div class="slot-actions">
							<button
								type="button"
								class="btn-maestro btn-complete"
								:disabled="updateTask.isPending.value"
								@click="completePedestalTask(activeDuo[slotIndex])"
							>
								Ukończ
							</button>
							<button
								type="button"
								class="btn-maestro btn-demote"
								:disabled="favoriteTask.isPending.value"
								@click="demoteFromPedestal(activeDuo[slotIndex])"
							>
								Do backlogu
							</button>
						</div>
					</template>

					<template v-else>
						<div class="slot-empty">
							<span class="slot-number">SLOT 0{{ slotIndex + 1 }} — WOLNY</span>
							<p>Wybierz jedno zadanie z Magazynu 4 × 3 poniżej</p>
						</div>
					</template>
				</div>
			</div>
		</section>

		<!-- SEKCJA 2: MAGAZYN 4 FILARY × 3 PODKATEGORIE -->
		<section class="warehouse-section">
			<header class="section-header">
				<div class="title-group">
					<h2>Magazyn Filarów</h2>
					<span class="count-pill">{{ backlogTasks.length }} w poczekalni</span>
				</div>
				<div class="quick-global-add">
					<AddTask @tasksAdded="refetchTasks" />
				</div>
			</header>

			<div v-if="projectList.isLoading" class="empty-state">
				Ładowanie struktury Filarów...
			</div>

			<div v-else-if="pillars.length === 0" class="empty-state">
				Brak Filarów. Utwórz w menu bocznym 4 projekty główne (Filary) oraz po 3
				podprojekty (Podkategorie) wewnątrz każdego z nich.
			</div>

			<div v-else class="pillars-grid">
				<article v-for="pillar in pillars" :key="pillar.id" class="pillar-card">
					<div class="pillar-header">
						<RouterLink :to="`/projects/${pillar.id}`" class="pillar-title">
							<span
								class="pillar-dot"
								:style="{
									backgroundColor: pillar.hex_color
										? `#${pillar.hex_color.replace('#', '')}`
										: 'var(--primary)',
								}"
							/>
							<h3>{{ pillar.title }}</h3>
						</RouterLink>
						<span class="pillar-counter">
							{{ getSubcategories(pillar.id!).length }} kat.
						</span>
					</div>

					<!-- Podkategorie (3 kolumny / bloki na Filar) -->
					<div class="subcategories-list">
						<div
							v-for="sub in getSubcategories(pillar.id!)"
							:key="sub.id"
							class="subcategory-block"
						>
							<div class="subcategory-header">
								<RouterLink
									:to="`/projects/${sub.id}`"
									class="subcategory-name"
								>
									{{ sub.title }}
								</RouterLink>
								<span class="sub-count">
									{{ getBacklogForProject(sub.id!).length }}
								</span>
							</div>

							<ul
								v-if="getBacklogForProject(sub.id!).length > 0"
								class="task-backlog-list"
							>
								<li
									v-for="task in getBacklogForProject(sub.id!)"
									:key="task.id"
									class="backlog-item"
								>
									<span class="backlog-title">{{ task.title }}</span>
									<button
										type="button"
										class="btn-promote"
										:disabled="isPedestalFull || favoriteTask.isPending.value"
										:title="
											isPedestalFull
												? 'Piedestał pełny (2/2). Najpierw ukończ lub cofnij aktywne zadanie.'
												: 'Wrzuć na Piedestał'
										"
										@click="promoteToPedestal(task)"
									>
										Na Piedestał
									</button>
								</li>
							</ul>

							<!-- Szybkie dodawanie zadania bezpośrednio do podkategorii -->
							<form
								class="inline-add-form"
								@submit.prevent="handleQuickSubAdd(sub.id!)"
							>
								<input
									v-model="newTaskTitles[sub.id!]"
									type="text"
									class="inline-add-input"
									:placeholder="`+ Dodaj do ${sub.title}...`"
								/>
							</form>
						</div>

						<!-- Zadania przypięte bezpośrednio do Filaru (jeśli istnieją) -->
						<div
							v-if="getBacklogForProject(pillar.id!).length > 0"
							class="subcategory-block is-root-tasks"
						>
							<div class="subcategory-header">
								<span class="subcategory-name">Bezpośrednio w Filarze</span>
								<span class="sub-count">{{
									getBacklogForProject(pillar.id!).length
								}}</span>
							</div>
							<ul class="task-backlog-list">
								<li
									v-for="task in getBacklogForProject(pillar.id!)"
									:key="task.id"
									class="backlog-item"
								>
									<span class="backlog-title">{{ task.title }}</span>
									<button
										type="button"
										class="btn-promote"
										:disabled="isPedestalFull || favoriteTask.isPending.value"
										:title="
											isPedestalFull
												? 'Piedestał pełny (2/2)'
												: 'Wrzuć na Piedestał'
										"
										@click="promoteToPedestal(task)"
									>
										Na Piedestał
									</button>
								</li>
							</ul>
						</div>
					</div>
				</article>
			</div>
		</section>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuery } from "@tanstack/vue-query";

import AddTask from "@/components/tasks/AddTask.vue";
import {
	allTasksQuery,
	getDefaultTaskFilterParams,
	type TaskResponse,
} from "@/client/queries/tasks";
import {
	useFavoriteTaskMutation,
	useUpdateTaskMutation,
	useCreateTaskMutation,
} from "@/client/queries/taskMutations";
import {
	parseQuickAddPrefill,
	QUICK_ADD_PREFILL_PARAMS,
} from "@/helpers/quickAddPrefill";
import { useProjects } from "@/composables/useProjects";
import { useAuthStore } from "@/stores/auth";
import { useBaseStore } from "@/stores/base";

const authStore = useAuthStore();
const projectList = useProjects();
const route = useRoute();
const router = useRouter();
const baseStore = useBaseStore();

watch(
	() => route.query,
	(query) => {
		const prefill = parseQuickAddPrefill(query);
		if (prefill === null) return;
		baseStore.setQuickActionsActive(true, prefill);
		const rest = { ...query };
		QUICK_ADD_PREFILL_PARAMS.forEach((param) => delete rest[param]);
		router.replace({ name: "home", query: rest });
	},
	{ immediate: true },
);

// Pobieramy wszystkie nieukończone zadania z całej instancji
const openTasksScope = computed(() => ({
	project: null,
	params: {
		...getDefaultTaskFilterParams(),
		sort_by: ["priority", "id"],
		order_by: ["desc", "desc"],
		filter: "done = false",
	},
}));

const { data: openTasksData, refetch: refetchTasks } = useQuery(
	computed(() => ({
		...allTasksQuery(openTasksScope.value),
		enabled: authStore.authenticated,
	})),
);

const openTasks = computed<TaskResponse[]>(() => openTasksData.value ?? []);

// Aktywne Duo = zadania z gwiazdką (is_favorite = true) i done = false
const activeDuo = computed<TaskResponse[]>(() =>
	openTasks.value.filter((task) => task.is_favorite && !task.done),
);

const isPedestalFull = computed<boolean>(() => activeDuo.value.length >= 2);

// Zadania w magazynie = otwarte i niebędące na Piedestale
const backlogTasks = computed<TaskResponse[]>(() =>
	openTasks.value.filter((task) => !task.is_favorite && !task.done),
);

// Struktura 4 Filarów (projekty główne) i Podkategorii (podprojekty)
const allActiveProjects = computed(() =>
	Object.values(projectList.projects)
		.filter((p) => p && (p.id ?? 0) > 0 && !p.is_archived)
		.sort(
			(a, b) =>
				(a.position ?? 0) - (b.position ?? 0) || (a.id ?? 0) - (b.id ?? 0),
		),
);

const pillars = computed(() =>
	allActiveProjects.value.filter(
		(p) => !p.parent_project_id || p.parent_project_id === 0,
	),
);

function getSubcategories(pillarId: number) {
	return allActiveProjects.value.filter(
		(p) => p.parent_project_id === pillarId,
	);
}

function getBacklogForProject(projectId: number): TaskResponse[] {
	return backlogTasks.value.filter((t) => t.project_id === projectId);
}

function getProjectBreadcrumb(projectId: number): string {
	const project = projectList.projects[projectId];
	if (!project) return "Nieprzypisane";
	if (
		project.parent_project_id &&
		projectList.projects[project.parent_project_id]
	) {
		return `${projectList.projects[project.parent_project_id].title} / ${project.title}`;
	}
	return project.title ?? "Projekt";
}

// Mutacje API
const favoriteTask = useFavoriteTaskMutation();
const updateTask = useUpdateTaskMutation();
const createTask = useCreateTaskMutation();

function promoteToPedestal(task: TaskResponse) {
	if (isPedestalFull.value) return;
	favoriteTask.mutate(
		{ id: task.id, is_favorite: false },
		{ onSuccess: () => void refetchTasks() },
	);
}

function demoteFromPedestal(task: TaskResponse) {
	favoriteTask.mutate(
		{ id: task.id, is_favorite: true },
		{ onSuccess: () => void refetchTasks() },
	);
}

function completePedestalTask(task: TaskResponse) {
	updateTask.mutate(
		{ id: task.id, done: true, is_favorite: false },
		{ onSuccess: () => void refetchTasks() },
	);
}

const newTaskTitles = reactive<Record<number, string>>({});

function handleQuickSubAdd(projectId: number) {
	const title = (newTaskTitles[projectId] ?? "").trim();
	if (!title) return;
	newTaskTitles[projectId] = "";
	createTask.mutate(
		{ title, project_id: projectId },
		{ onSuccess: () => void refetchTasks() },
	);
}
</script>

<style scoped lang="scss">
.maestro-cockpit {
	max-width: 1360px;
	margin: 0 auto;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 2.25rem;
}

.section-header {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	align-items: center;
	gap: 0.75rem;
	margin-block-end: 1rem;
}

.title-group {
	display: flex;
	align-items: center;
	gap: 0.75rem;

	h1,
	h2 {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 600 !important;
		color: var(--grey-900);
		letter-spacing: 0.01em;
	}
}

.section-subtitle {
	margin: 0;
	font-size: 0.85rem;
	color: var(--grey-500);
}

.owl-badge {
	background: hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.16);
	color: var(--primary);
	border: 1px solid var(--primary);
	padding: 0.2rem 0.6rem;
	border-radius: 4px;
	font-size: 0.78rem;
	font-weight: 700;
	letter-spacing: 0.06em;
}

.count-pill {
	background: var(--grey-100);
	color: var(--grey-600);
	border: 1px solid var(--grey-200);
	padding: 0.15rem 0.55rem;
	border-radius: 999px;
	font-size: 0.78rem;
}

/* PIEDESTAŁ */
.pedestal-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.25rem;

	@media screen and (max-width: 768px) {
		grid-template-columns: 1fr;
	}
}

.pedestal-slot {
	background: var(--grey-100);
	border: 1px dashed var(--grey-300);
	border-radius: 8px;
	padding: 1.25rem;
	min-height: 152px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease;

	&.is-occupied {
		border: 1px solid var(--primary);
		box-shadow: 0 0 0 1px
			hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.2);
	}
}

.slot-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.75rem;
}

.slot-number {
	color: var(--primary);
	font-weight: 700;
	letter-spacing: 0.08em;
}

.slot-project {
	color: var(--grey-500);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.slot-title {
	margin: 0.75rem 0 1rem;
	font-size: 1.15rem;
	font-weight: 600 !important;
	color: var(--grey-900);
	line-height: 1.4;
}

.slot-actions {
	display: flex;
	gap: 0.65rem;
}

.btn-maestro {
	padding: 0.45rem 0.9rem;
	border-radius: 5px;
	font-size: 0.85rem;
	font-weight: 600;
	cursor: pointer;
	border: 1px solid transparent;
	transition:
		opacity 0.15s ease,
		background-color 0.15s ease;

	&:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
}

.btn-complete {
	background: var(--primary);
	color: var(--primary-invert);

	&:hover:not(:disabled) {
		background: var(--link-hover);
	}
}

.btn-demote {
	background: transparent;
	border-color: var(--grey-300);
	color: var(--grey-700);

	&:hover:not(:disabled) {
		border-color: var(--grey-500);
		color: var(--grey-900);
	}
}

.slot-empty {
	margin: auto;
	text-align: center;

	p {
		margin: 0.4rem 0 0;
		font-size: 0.85rem;
		color: var(--grey-500);
	}
}

/* MAGAZYN 4 × 3 */
.quick-global-add {
	min-width: 280px;
}

.pillars-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1.25rem;

	@media screen and (max-width: 1024px) {
		grid-template-columns: 1fr;
	}
}

.pillar-card {
	background: var(--grey-100);
	border: 1px solid var(--grey-200);
	border-radius: 8px;
	padding: 1.15rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.pillar-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-block-end: 0.65rem;
	border-block-end: 1px solid var(--grey-200);
}

.pillar-title {
	display: flex;
	align-items: center;
	gap: 0.6rem;
	text-decoration: none;

	h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600 !important;
		color: var(--grey-900);
	}

	&:hover h3 {
		color: var(--primary);
	}
}

.pillar-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	flex-shrink: 0;
}

.pillar-counter {
	font-size: 0.75rem;
	color: var(--grey-500);
}

.subcategories-list {
	display: flex;
	flex-direction: column;
	gap: 0.85rem;
}

.subcategory-block {
	background: var(--grey-50);
	border: 1px solid var(--grey-200);
	border-radius: 6px;
	padding: 0.75rem;
}

.subcategory-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-block-end: 0.5rem;
}

.subcategory-name {
	font-size: 0.88rem;
	font-weight: 600;
	color: var(--grey-800);
	text-decoration: none;

	&:hover {
		color: var(--primary);
	}
}

.sub-count {
	font-size: 0.75rem;
	color: var(--grey-500);
}

.task-backlog-list {
	list-style: none;
	margin: 0 0 0.5rem;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
}

.backlog-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 0.5rem;
	padding: 0.4rem 0.55rem;
	background: var(--grey-100);
	border: 1px solid var(--grey-200);
	border-radius: 4px;
}

.backlog-title {
	font-size: 0.85rem;
	color: var(--grey-800);
	line-height: 1.3;
}

.btn-promote {
	flex-shrink: 0;
	padding: 0.25rem 0.55rem;
	font-size: 0.75rem;
	font-weight: 600;
	border-radius: 4px;
	border: 1px solid var(--primary);
	background: transparent;
	color: var(--primary);
	cursor: pointer;
	transition:
		background-color 0.15s ease,
		color 0.15s ease;

	&:hover:not(:disabled) {
		background: var(--primary);
		color: var(--primary-invert);
	}

	&:disabled {
		border-color: var(--grey-300);
		color: var(--grey-400);
		cursor: not-allowed;
	}
}

.inline-add-input {
	width: 100%;
	background: transparent;
	border: 1px dashed var(--grey-300);
	border-radius: 4px;
	padding: 0.35rem 0.55rem;
	font-size: 0.8rem;
	color: var(--grey-800);

	&::placeholder {
		color: var(--grey-500);
	}

	&:focus {
		border-style: solid;
		border-color: var(--primary);
	}
}

.empty-state {
	padding: 2rem;
	text-align: center;
	background: var(--grey-100);
	border: 1px dashed var(--grey-300);
	border-radius: 8px;
	color: var(--grey-500);
}
</style>
