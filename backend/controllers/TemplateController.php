<?php

class XXXXzzzTemplateController extends \Rainbow\Controllers\ControllerBase
{
	public function initialize() {
		$this->response->setContentType('application/json');
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //
    //  Actions
    //
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    public function indexAction() {
        $this->sendJson(['view' => 'index']);
    }

    public function projectsAction() {
        $this->forward('//projects/list');
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //
    //  Private methods
    //
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    private function generateInput($data) {
    	if(!$data)
    		$data = [];

    	$pd = $data['i-pd'] * 1.0;
    	$fd = $data['i-fd'] * 1.0;
    	$prpz = $data['i-prpz'] * 1.0;
    	$prfz = $data['i-prfz'] * 1.0;
    	$frfz = $data['i-frfz'] * 1.0;
    	$prpr = $data['i-prpr'] * 1.0;
    	$ppr = $data['i-ppr'] * 1.0;

    	$inputData = [
			[
				'info' => 'срок по плану',
				'caption' => 'ПД',
				'name' => 'i-pd',
				'type' => 'number',
				'value' => $pd,
			],
			[
				'info' => 'срок по факту',
				'caption' => 'ФД',
				'name' => 'i-fd',
				'type' => 'number',
				'value' => $fd,
			],
			[
				'info' => 'бюджет',
				'caption' => 'ПРПЗ',
				'name' => 'i-prpz',
				'type' => 'number',
				'value' => $prpz,
			],
			[
				'info' => 'план потрачено',
				'caption' => 'ПРФЗ',
				'name' => 'i-prfz',
				'type' => 'number',
				'value' => $prfz,
			],
			[
				'info' => 'факт потрачено',
				'caption' => 'ФРФЗ',
				'name' => 'i-frfz',
				'type' => 'number',
				'value' => $frfz,
			],
			[
				'caption' => 'ПРПР',
				'name' => 'i-prpr',
				'type' => 'number',
				'value' => $prpr,
			],
			[
				'info' => 'план по прибыли',
				'caption' => 'ППР',
				'name' => 'i-ppr',
				'type' => 'number',
				'value' => $ppr,
			],
		];

		return $inputData;
    }

    private function calculate($data) {
    	$pd = $data['i-pd'] * 1.0;
    	$fd = $data['i-fd'] * 1.0;
    	$prpz = $data['i-prpz'] * 1.0;
    	$prfz = $data['i-prfz'] * 1.0;
    	$frfz = $data['i-frfz'] * 1.0;
    	$prpr = $data['i-prpr'] * 1.0;
    	$ppr = $data['i-ppr'] * 1.0;

    	$kd = ($fd<$pd ? 1.0 : $pd/$fd);
    	$ks = ($prfz/$prpz) * $kd;
    	$kpr = (!$prpr || !$ppr ? 1.0 : $prpr / $ppr);
    	$kr = 1+(1-$frfz/$prfz)*$kpr;
    	$eff = $ks*$kr;

    	$outputData = [
    		[
    			'caption' => 'Кд',
    			'name' => 'o-kd',
    			'value' => $kd,
    		],
    		[
    			'caption' => 'Кс',
    			'name' => 'o-ks',
    			'value' => $ks,
    		],
    		[
    			'caption' => 'Кпр',
    			'name' => 'o-kpr',
    			'value' => $kpr,
    		],
    		[
    			'caption' => 'Кр',
    			'name' => 'o-kr',
    			'value' => $kr,
    		],
    		[
    			'caption' => 'Э',
    			'name' => 'o-eff',
    			'value' => $eff,
    		],
    	];

    	return $outputData;
    }
}
