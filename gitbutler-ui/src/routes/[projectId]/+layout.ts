import { getFetchNotifications } from '$lib/stores/fetches';
import { getHeads } from '$lib/stores/head';
import { BranchController } from '$lib/vbranches/branchController';
import { BaseBranchService, VirtualBranchService } from '$lib/vbranches/branchStoresCache';
import type { LayoutLoad } from './$types';
import { GitHubService } from '$lib/github/service';
import { RemoteBranchService } from '$lib/stores/remoteBranches';
import { BranchService } from '$lib/branches/service';

export const prerender = false;

export const load: LayoutLoad = async ({ params, parent }) => {
	const { user$, projectService, userService } = await parent();
	const projectId = params.projectId;
	const project$ = projectService.getProject(projectId);
	const fetches$ = getFetchNotifications(projectId);
	const heads$ = getHeads(projectId);
	const baseBranchService = new BaseBranchService(projectId, fetches$, heads$);
	const vbranchService = new VirtualBranchService(projectId);

	const remoteBranchService = new RemoteBranchService(
		projectId,
		fetches$,
		heads$,
		baseBranchService.base$
	);
	const branchController = new BranchController(
		projectId,
		vbranchService,
		remoteBranchService,
		baseBranchService
	);

	const githubService = new GitHubService(
		branchController,
		vbranchService,
		userService,
		baseBranchService
	);
	const branchService = new BranchService(vbranchService, remoteBranchService, githubService);

	return {
		projectId,
		branchController,
		baseBranchService,
		githubService,
		vbranchService,
		remoteBranchService,
		user$,
		project$,
		branchService
	};
};