import { Markdown } from '@components/discord';
import { findByDisplayName } from '@webpack';
import { Modals } from '@webpack/common';
import React from 'react';

const cache = {};

interface ConfirmModalProps {
   confirmButtonColor?: string;
   bodyClassName?: string;
   confirmText?: string;
   cancelText?: string;
   className?: string;
   loading?: boolean;
   content: string;
   header: string;
   onConfirm?: Fn;
   onCancel?: Fn;
   onClose?: Fn;

   [key: string]: any;
}

export function showConfirmModal(options: ConfirmModalProps) {
   cache['ConfirmModal'] ??= findByDisplayName('ConfirmModal');
   const ConfirmModal = cache['ConfirmModal'];

   return Modals.openModal(props =>
      <ConfirmModal
         {...options}
         {...props}
      >
         <Markdown>{options.content}</Markdown>
      </ConfirmModal>
   );
}