
import {AddRemoveMemberModel} from "../../../connection/models/AddRemoveMemberModel";
import {AddMembersToTeamModel} from "../../../connection/AddMembersToTeamModel";
import {UpdateTeamModel} from "../../../connection/models/UpdateTeamModel";
import {ConfirmationModal} from "../../../common/ConfirmationModal";
import {ViewEnterTypes} from "../../../core/ViewEnterTypes";
import {ViewComponent} from "../../../core/ViewComponent";
import {ViewExitTypes} from "../../../core/ViewExitTypes";
import {SnackBarType} from "../../../common/SnackBarType";
import {ModalTypes} from "../../../common/ModalTypes";
import {ManageTeamSignals} from "./ManageTeamSignals";
import {AddMemberModal} from "./AddMemberModal";
import {View} from "../../../core/View";

declare const TweenLite: any;
declare const Power0: any;
declare const Back: any;

declare const SimpleBar: any;



// HTML
const template = require( "../../../templates/manage-teams.html" );






export class ManageTeams extends ViewComponent {

    private contentContainer: HTMLElement;

    private avatar: HTMLElement;
    private teamNameInput: HTMLInputElement;
    private deleteTeamBtn: HTMLElement;

    private addMemberBtn: HTMLElement;
    private mainMemberContainer: HTMLElement;
    private memberContainer: HTMLElement;

    private mainTeamContainer: HTMLElement;
    private teamContainer: HTMLElement;

    private createTeamBtn: HTMLElement;

    private loadedTeamId: string;

    private nameInputTimer: any;

    private addMemberModal: AddMemberModal;

    private inviteBtn: HTMLElement;

    private emptyState: HTMLElement;
    private emptyStateCreateTeamBtn: HTMLElement;

    private membersEmptyState: HTMLElement;


    constructor(view: View, container: HTMLElement) {
        super( view, container, "ManageTeams" );

        this.container.innerHTML        = template;

        this.contentContainer           = document.getElementById( "manage-teams-content-container" );

        this.avatar                     = document.getElementById( "main-scrum-master-avatar" );
        this.inviteBtn                  = document.getElementById( "manage-team-invite-scrum-master-btn" );
        this.teamNameInput              = document.getElementById( "manage-teams-input-edit-team-name" ) as HTMLInputElement;

        this.deleteTeamBtn              = document.getElementById( "manage-teams-delete-team-button" );
        this.addMemberBtn               = document.getElementById( "manage-teams-add-member-button" );

        this.mainMemberContainer        = document.getElementById( "team-members-list-container" );

        new SimpleBar( this.mainMemberContainer );

        this.memberContainer            = this.mainMemberContainer.getElementsByClassName( "simplebar-content" )[0] as HTMLElement;

        this.mainTeamContainer          = document.getElementById( "teams-list-container" );

        new SimpleBar( this.mainTeamContainer );

        this.teamContainer              = this.mainTeamContainer.getElementsByClassName( "simplebar-content" )[0] as HTMLElement;

        this.createTeamBtn              = document.getElementById( "manage-teams-add-new-team-btn" );

        this.emptyState                 = document.getElementById( "manage-teams-empty-state-container" );
        this.emptyStateCreateTeamBtn    = document.getElementById( "manage-teams-empty-state-add-new-team-btn" );

        this.membersEmptyState          = document.getElementById( "manage-teams-list-empty-state" );

        this.addMemberModal             = new AddMemberModal( this );


        this.createTeamHandler          = this.createTeamHandler.bind( this );
        this.deleteTeamHandler          = this.deleteTeamHandler.bind( this );
        this.removeMember               = this.removeMember.bind( this );
        this.nameInputHandler           = this.nameInputHandler.bind( this );
        this.addMemberHandler           = this.addMemberHandler.bind( this );
        this.inviteBtnHandler           = this.inviteBtnHandler.bind( this );

        this.enterScene();
    }



    private registerEventListeners(): void {
        this.createTeamBtn.addEventListener( "click", this.createTeamHandler );
        this.emptyStateCreateTeamBtn.addEventListener( "click", this.createTeamHandler );
        this.deleteTeamBtn.addEventListener( "click", this.deleteTeamHandler );
        this.teamNameInput.addEventListener( "keyup", this.nameInputHandler );
        this.addMemberBtn.addEventListener( "click", this.addMemberHandler );
        this.inviteBtn.addEventListener( "click", this.inviteBtnHandler );
    }



    private unregisterEventListeners(): void {
        this.createTeamBtn.removeEventListener( "click", this.createTeamHandler );
        this.emptyStateCreateTeamBtn.removeEventListener( "click", this.createTeamHandler );
        this.deleteTeamBtn.removeEventListener( "click", this.deleteTeamHandler );
        this.teamNameInput.removeEventListener( "keyup", this.nameInputHandler );
        this.addMemberBtn.removeEventListener( "click", this.addMemberHandler );
        this.inviteBtn.removeEventListener( "click", this.inviteBtnHandler );
    }



    private inviteBtnHandler(): void {
        this.snackbar.show( SnackBarType.WARNING, "Invite <strong>scrum master</strong> feature coming soon!" );
    }


    private addMemberHandler(): void {
        this.addMemberModal.enterScene();
        this.sendSignal( ManageTeamSignals.FOREGROUND_ACTIVE );
    }



    private nameInputHandler(): void {

        if ( this.nameInputTimer ) clearTimeout( this.nameInputTimer );

        if ( ! this.teamNameInput.value ) {
            return this.snackbar.show( SnackBarType.ERROR, "Please provide a name for the team!" );
        }

        const teamUpdate = new UpdateTeamModel(
            this.loadedTeamId,
            this.teamNameInput.value,
            null
        );

        this.nameInputTimer = setTimeout( () => {

            this.connection.updateTeam(
                teamUpdate,
                (response: any) => {
                    document.getElementById( teamUpdate.id ).innerText = teamUpdate.name;

                    console.log( response );
                },
                (err: Error) => console.error( err )
            );

        }, 250 );
    }



    private deleteTeamHandler(): void {

        this.sendSignal( ManageTeamSignals.FOREGROUND_ACTIVE );

        const teamName = this.teamNameInput.value;

        new ConfirmationModal(
            ModalTypes.DELETE,
            "Yes, Delete team",
            "Cancel",
            "Deleting team",
            [
                `Are you sure you want to DELETE the team <strong>${ teamName }</strong>?`,
                "<br> All the members within the team will be deleted, and all their notes and impediments will be lost forever. This operation cannot be undone!"
            ]
        )
            .onSubmit( () => {

                this.sendSignal( ManageTeamSignals.FOREGROUND_INACTIVE );

                this.connection.deleteTeam(
                    this.loadedTeamId,
                    () => {
                        this.deletedTeam( this.loadedTeamId );
                        this.snackbar.show( SnackBarType.SUCCESS, `Deleted team <strong>${ teamName }</strong>` );
                    },
                    (err: string) => console.error( err )
                );
            })
            .onDismiss( () => this.sendSignal( ManageTeamSignals.FOREGROUND_INACTIVE ) );
    }



    private deletedTeam(teamId: string): void {

        const team = document.getElementById( teamId );
        team.parentNode.removeChild( team );

        this.loadTeamData();
    }



    private createTeamHandler(): void {
        this.sendSignal( ManageTeamSignals.CREATE_TEAM );
    }



    private populateTeams(resolve: Function): void {

        this.teamContainer.innerHTML = '';

        this.connection.getTeams(
            (response: any) => {
                console.log( response );

                const { teams } = response;

                if ( ! teams.length ) {
                    this.showEmptyState();
                } else {
                    this.hideEmptyState();
                }

                for ( let team of teams ) {
                    this.addTeam( team );
                }

                resolve();

            },
            (err: string) => console.error( err )
        );
    }



    private addTeam(teamData: any, prepend?: boolean) {

        console.info( "addteam called ", teamData );

        let team        = document.createElement( "div" );
        team.id         = teamData._id;
        team.className  = "teams-list-item";
        team.innerText  = teamData.name;

        if ( prepend ) {
            this.teamContainer.insertBefore( team, this.teamContainer.firstChild );
        } else {
            this.teamContainer.appendChild( team );
        }

        team.addEventListener( "click", () => this.selectTeam( team ) );
    }



    private selectTeam(team: HTMLElement): void {
        const teamElements = document.getElementsByClassName( "teams-list-item" );

        for ( let i = 0; i < teamElements.length; i++ ) {
            teamElements[i].classList.remove( "active" );
        }

        team.classList.add( "active" );

        this.loadTeamData( team.id );
    }



    private populateMembers(teamId: string): void {

        this.memberContainer.innerHTML = '';

        /** Get the members of the team and mark them as active members of the team */
        this.connection.getMembersOfTeam(
            teamId,
            (response: any) => {
                const { members } = response;

                if ( ! members.length ) {
                    this.membersEmptyState.style.display = "block";
                } else {
                    this.membersEmptyState.style.display = "none";
                }

                for ( let member of members ) {
                    this.addMember( member );
                }
            },
            (err: string) => console.error( err )
        );
    }



    private addMember(memberData: any): void {
        let member          = document.createElement( "div" );
        member.innerText    = memberData.name;
        member.id           = memberData._id;
        member.className    = "team-members-list-item";

        let removeBtn        = document.createElement( "div" );
        removeBtn.className  = "remove-member-btn";

        member.appendChild( removeBtn );

        this.memberContainer.insertBefore( member, this.memberContainer.firstChild );

        removeBtn.addEventListener( "click", () => this.removeMember( member ) );
    }



    private removeMember(member: HTMLElement): void {

        const removeMemberData = new AddRemoveMemberModel( member.id, this.loadedTeamId );

        new ConfirmationModal(
            ModalTypes.DELETE,
            "Yes, Remove Member",
            "Cancel, Keep Member",
            "Remove member",
            [
                `Are you sure you want to remove <strong>${ member.innerText }</strong> from the team <strong>${ this.teamNameInput.value }</strong>?`,
                "<br> All their notes and impediments will be deleted, and the operation cannot be undone."
            ]
        )
            .onSubmit( () => {

                this.connection.removeMemberFromTeam(
                    removeMemberData,
                    () => {
                        member.parentNode.removeChild( member );
                        this.snackbar.show( SnackBarType.SUCCESS, `Removed member <strong>${ member.innerText }</strong>` );

                        if ( ! this.memberContainer.children.length ) this.membersEmptyState.style.display = "block";
                    },
                    (err: string) => console.error( err )
                );
            })
            .onDismiss( () => console.info( "Modal dismissed." ) );
    }



    private loadTeamData(id?: string): void {

        let team: Element;

        if ( ! id ) {
            /** If there is no id specified, we default to the first team in the list */
            team = this.teamContainer.firstElementChild;
        } else {
            /** If we got the team id as an argument, we isolate the element and extract the id later  */
            team = document.getElementById( id );
        }

        /** If there is no valid team, we return */
        if ( ! team ) return this.showEmptyState();

        team.classList.add( "active" );

        /** We save the currently loaded team Id (will be used for further operations, e.g. updating the team on save) */
        this.loadedTeamId = team.id;

        /** Set the input value as the name of the team selected */
        this.teamNameInput.value = team.innerHTML;


        this.populateMembers( this.loadedTeamId );
    }



    public getCurrentlyLoadedTeamName(): string {
        return document.getElementById( this.loadedTeamId ).innerText;
    }



    public getCurrentMembersOfTeam(): string[] {
        let members = [];

        for ( let i = 0; i < this.memberContainer.children.length; i++ ) {
            members.push( this.memberContainer.children[ i ].id );
        }

        return members;
    }



    public addMembersToTeam(members: string[]): void {

        const addMembersModel = new AddMembersToTeamModel( this.loadedTeamId, members );

        this.connection.addMembersToTeam(
            addMembersModel,
            (response: any) => {

                const { members } = response;

                if ( members.length ) this.membersEmptyState.style.display = "none";

                for ( let member of members ) {
                    this.addMember( member );
                }
            },
            (err: Error) => console.error( err )
        );

    }



    public addMemberModalExited(): void {
        this.sendSignal( ManageTeamSignals.FOREGROUND_INACTIVE );
    }



    public setAvatarInitials(): void {
        const userData = this.connection.getVO();

        const names = userData.name.split( " " );

        let monogram = "";

        for ( let name of names ) {
            monogram += name[0];
        }

        this.avatar.innerText = monogram;
    }



    private showEmptyState(): void {
        this.contentContainer.style.display     = "none";
        this.emptyState.style.display           = "block";
    }



    private hideEmptyState(): void {
        this.emptyState.style.display           = "none";
        this.contentContainer.style.display     = "block";
    }



    public enterScene(enterType?: string) {
        console.info( "Enter being called in scrum manage teams view component" );
        this.registerEventListeners();

        this.setAvatarInitials();

        Promise.all([
            new Promise<void>( (resolve, reject) => this.populateTeams( resolve ) ),
        ])
            .then( () => this.loadTeamData() )
            .catch( (err: string) => console.error( err ) );

        switch ( enterType ) {

            case ViewEnterTypes.SWITCH_COMPONENT :
                this.view.container.appendChild( this.container );
                break;

            default :

                break;
        }
    }



    public exitScene(exitType?: string): void {
        console.info( "Exit being called in scrum manage teams view component" );

        this.unregisterEventListeners();

        switch ( exitType ) {
            case ViewExitTypes.SWITCH_COMPONENT :

                if ( this.container.parentNode ) {
                    this.container.parentNode.removeChild( this.container );
                }

                break;

            default :
                super.exitScene( exitType );
                this.view.componentExited( this.name );
                break;
        }
    }
}