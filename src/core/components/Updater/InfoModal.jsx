const { Modal, FormTitle, FormText, Spinner, Anchor } = require('@components');
const { unboundStrings: strings } = require('@api/i18n');
const { paths } = require('@constants');
const Git = require('@modules/git');
const React = require('react');

module.exports = class InfoModal extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         branch: null,
         commit: null
      };
   }

   render() {
      return <Modal.ModalRoot className='unbound-info-modal' size={Modal.ModalSize.SMALL} {...this.props}>
         <Modal.ModalHeader separator={false}>
            <FormTitle className='unbound-info-modal-header' tag='h1'>
               {strings.CLIENT_INFORMATION}
            </FormTitle>
            <Modal.ModalCloseButton onClick={this.props.onClose} />
         </Modal.ModalHeader>
         <Modal.ModalContent>
            <FormTitle className='unbound-form-title-small-margin' tag='h5'>
               {strings.BRANCH}
            </FormTitle>
            <FormText className='unbound-updater-info-text'>
               {this.state.branch ?
                  <Anchor
                     className='unbound-addon-author'
                     onClick={() => open(`https://github.com/unbound-mod/unbound/tree/${this.state.branch}`)}
                  >
                     {this.state.branch}
                  </Anchor>
                  :
                  <Spinner type={Spinner.Type.PULSING_ELLIPSIS} />
               }
            </FormText>
            <FormTitle className='unbound-form-title-small-margin' tag='h5'>
               {strings.CURRENT_COMMIT}
            </FormTitle>
            <FormText className='unbound-updater-info-text'>
               {this.state.commit?.short ?
                  <Anchor
                     className='unbound-addon-author'
                     onClick={() => open(`https://github.com/unbound-mod/unbound/commit/${this.state.commit?.longHash}`)}
                  >
                     {this.state.commit.short}
                  </Anchor>
                  :
                  <Spinner type={Spinner.Type.PULSING_ELLIPSIS} />
               }
            </FormText>
         </Modal.ModalContent>
      </Modal.ModalRoot>;
   }

   async componentWillMount() {
      try {
         if (!Git.isRepo(paths.root)) throw 'Nope.';
         const branch = await Git.getBranch(paths.root);
         const commit = await Git.getCommit(paths.root, branch);

         this.setState({ commit, branch });
      } catch (e) {
         this.setState({ commit: 'N/A', branch: 'N/A' });
      }
   }
};